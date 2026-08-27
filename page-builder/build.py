import xml.etree.ElementTree as ET
import glob
import re
import os

from mermaid_generator import generate_mermaid_code

# ---------------------------------------------------------
# 1. GENERATE MERMAID DIAGRAM
# ---------------------------------------------------------
mermaid_code = generate_mermaid_code()


# ---------------------------------------------------------
# 2. ASSEMBLE HARNESS AND GENERATE JSON DATA
# ---------------------------------------------------------
import json
import shutil
import os

# Copy the static harness app to dist
os.makedirs('../dist', exist_ok=True)
shutil.copytree('harness', '../dist', dirs_exist_ok=True)

tree = ET.parse('../soap-xml/PageContent.xml')
root = tree.getroot()

def get_text(parent, path):
    el = parent.find(path)
    return ' '.join(el.text.strip().split()) if el is not None and el.text else ""

def inner_xml(element):
    if element is None: return ""
    return ' '.join(((element.text or "") + "".join(ET.tostring(child, encoding='unicode') for child in element)).strip().split())

meta = root.find('meta')
content = {
    "meta": {
        "pageTitle": get_text(meta, 'title'),
        "pageSubtitle": get_text(meta, 'subtitle'),
        "diagramHint": get_text(meta, 'diagramHint')
    },
    "sidebar": {
        "heading": "Component Details",
        "emptyState": "Click on any colored component\nin the diagram to view its details here.",
        "labelIdentifier": "Identifier"
    },
    "sections": {},
    "nodes": {},
    "definitions": {}
}

# parse definitions
for f in glob.glob("../soap-xml/definitions/*.xml"):
    if os.path.basename(f) == "_definitions.xml": continue
    dtree = ET.parse(f)
    droot = dtree.getroot()
    d_id = droot.get("id")
    if d_id:
        assigned_to = []
        assigned_node = droot.find("assignedTo")
        if assigned_node is not None:
            for ref in assigned_node.findall("nodeRef"):
                if ref.get("id"):
                    assigned_to.append(ref.get("id"))
                    
        content["definitions"][d_id] = {
            "icon": get_text(droot, "icon"),
            "label": get_text(droot, "label"),
            "colorClass": get_text(droot, "colorClass"),
            "body": inner_xml(droot.find("body")),
            "_assignedTo": assigned_to
        }

language_data = {
    "languages": {
        "java": { "label": "Java" },
        "dotnet": { "label": ".NET / C#" },
        "python": { "label": "Python" }
    },
    "nodes": {},
    "facades": {},
    "tooling": {},
    "cicd": {}
}

# parse sections
sections = root.find('sections')
sec1 = sections.find("section[@id='understandingLayers']")
content["sections"]["understandingLayers"] = {
    "heading": get_text(sec1, 'heading'),
    "osi7": {
        "heading": inner_xml(sec1.find("subsections/subsection[@id='osi7']/heading")),
        "body": inner_xml(sec1.find("subsections/subsection[@id='osi7']/body"))
    },
    "proxy": {
        "heading": inner_xml(sec1.find("subsections/subsection[@id='proxy']/heading")),
        "body": inner_xml(sec1.find("subsections/subsection[@id='proxy']/body"))
    }
}

sec2 = sections.find("section[@id='proxyPattern']")
content["sections"]["proxyPattern"] = {
    "heading": inner_xml(sec2.find('heading')),
    "intro": inner_xml(sec2.find('intro')),
    "developerView": {
        "heading": inner_xml(sec2.find("subsections/subsection[@id='developerView']/heading")),
        "body": inner_xml(sec2.find("subsections/subsection[@id='developerView']/body"))
    },
    "hiddenComplexity": {
        "heading": inner_xml(sec2.find("subsections/subsection[@id='hiddenComplexity']/heading")),
        "body": inner_xml(sec2.find("subsections/subsection[@id='hiddenComplexity']/body")),
        "bullets": [inner_xml(b) for b in sec2.findall("subsections/subsection[@id='hiddenComplexity']/bullets/bullet")]
    },
    "leakyAbstraction": {
        "heading": inner_xml(sec2.find("subsections/subsection[@id='leakyAbstraction']/heading")),
        "body": inner_xml(sec2.find("subsections/subsection[@id='leakyAbstraction']/body"))
    }
}

for i, lang in enumerate(sec2.findall("languages/language")):
    l_id = lang.get("id")
    if i == 0:
        content["meta"]["defaultLanguage"] = l_id
    language_data["facades"][l_id] = (lang.find("facadeCode").text or "").strip()

sec3 = sections.find("section[@id='tooling']")
content["sections"]["tooling"] = {
    "heading": inner_xml(sec3.find('heading')),
    "intro": inner_xml(sec3.find('intro'))
}

for lang in sec3.findall("languages/language"):
    l_id = lang.get("id")
    language_data["tooling"][l_id] = {
        "dotColor": lang.get("dotColor") or "bg-slate-500",
        "heading": inner_xml(lang.find("heading")),
        "body": inner_xml(lang.find("body")),
        "code": (lang.find("code").text or "").strip()
    }
    cicd = lang.find("cicd")
    if cicd is not None:
        language_data["cicd"][l_id] = {
            "title": inner_xml(cicd.find("title")),
            "body": inner_xml(cicd.find("body"))
        }

# parse nodes
diagram_meta = {
    "subgraphs": [],
    "nodeToSubgraphMap": {},
    "labelToNodeMap": {},
    "nodeToLabelMap": {}
}
nav_nodes = []
edges_list = []

def extract_node_data(xml_node, parent_id=None):
    node_id = xml_node.get("id")
    if not node_id: return
    
    label_text = xml_node.get("label") or ""
    c_node = {}
    c_node["title"] = inner_xml(xml_node.find("title")) if xml_node.find("title") is not None else label_text or node_id
    c_node["overview"] = inner_xml(xml_node.find("overview")) if xml_node.find("overview") is not None else ""
    c_node["handledBy"] = inner_xml(xml_node.find("handledBy")) if xml_node.find("handledBy") is not None else ""
    c_node["devImpact"] = inner_xml(xml_node.find("devImpact")) if xml_node.find("devImpact") is not None else ""
    c_node["interaction"] = inner_xml(xml_node.find("interaction")) if xml_node.find("interaction") is not None else ""
    c_node["branching"] = inner_xml(xml_node.find("branching")) if xml_node.find("branching") is not None else ""
    c_node["considerations"] = inner_xml(xml_node.find("considerations")) if xml_node.find("considerations") is not None else ""
    c_node["codeSnippet"] = (xml_node.find("codeSnippet").text or "").strip() if xml_node.find("codeSnippet") is not None else ""
    
    sidebar = xml_node.find("sidebar")
    if sidebar is not None:
        c_node["title"] = inner_xml(sidebar.find("title")) if sidebar.find("title") is not None else c_node["title"]
        c_node["overview"] = inner_xml(sidebar.find("overview")) if sidebar.find("overview") is not None else c_node["overview"]
        c_node["handledBy"] = inner_xml(sidebar.find("handledBy")) if sidebar.find("handledBy") is not None else c_node["handledBy"]
        c_node["devImpact"] = inner_xml(sidebar.find("devImpact")) if sidebar.find("devImpact") is not None else c_node["devImpact"]
        c_node["interaction"] = inner_xml(sidebar.find("interaction")) if sidebar.find("interaction") is not None else c_node["interaction"]
        c_node["branching"] = inner_xml(sidebar.find("branching")) if sidebar.find("branching") is not None else c_node["branching"]
        c_node["considerations"] = inner_xml(sidebar.find("considerations")) if sidebar.find("considerations") is not None else c_node["considerations"]
    
    big = xml_node.find("bigPicture")
    if big is not None:
        c_node["isBigPicture"] = True
        c_node["bigPicture"] = {
            "role": inner_xml(big.find("role")),
            "summary": inner_xml(big.find("summary")),
            "whyItExists": inner_xml(big.find("whyItExists")),
            "journeyStep": inner_xml(big.find("journeyStep"))
        }

    nav = xml_node.find("navigation")
    if nav is not None:
        seq = nav.find("sequenceIndex")
        if seq is not None and seq.text:
            idx = float(seq.text.strip())
            nav_nodes.append((idx, node_id))
            if big is not None:
                nav_nodes.append((idx - 0.5, node_id + "_BigPicture"))
        autoselect = nav.find("autoSelect")
        if autoselect is not None and autoselect.text == "true":
            content["meta"]["initialNodeId"] = node_id

    def_pills = xml_node.find("definitionPills")
    if def_pills is not None:
        pills = []
        for pill in def_pills.findall("definitionRef"):
            pills.append({
                "id": pill.get("id"),
                "file": pill.get("file")
            })
        c_node["definitionPills"] = pills

    diagram = xml_node.find("diagram")
    if diagram is None and xml_node.findall("node"):
        diagram_meta["subgraphs"].append(node_id)
    if diagram is not None and parent_id:
        diagram_meta["nodeToSubgraphMap"][node_id] = parent_id
        label = diagram.findtext("nodeLabel")
        if label:
            clean_label = ' '.join(label.split()[1:]) if ' ' in label else label
            diagram_meta["labelToNodeMap"][clean_label] = node_id
            diagram_meta["labelToNodeMap"][label] = node_id
            diagram_meta["nodeToLabelMap"][node_id] = clean_label
    elif not parent_id and label_text:
        diagram_meta["nodeToLabelMap"][node_id] = label_text
        diagram_meta["labelToNodeMap"][label_text] = node_id

    content["nodes"][node_id] = {k: v for k, v in c_node.items() if v}
    
    langs = xml_node.find("languages")
    if langs is not None:
        l_node = {}
        for lang in langs.findall("language"):
            l_id = lang.get("id")
            di = inner_xml(lang.find("devImpact")) if lang.find("devImpact") is not None else None
            cs = (lang.find("codeSnippet").text or "").strip() if lang.find("codeSnippet") is not None else None
            title = inner_xml(lang.find("title")) if lang.find("title") is not None else None
            
            if di:
                if "devImpact" not in l_node: l_node["devImpact"] = {}
                l_node["devImpact"][l_id] = di
            if cs:
                if "codeSnippet" not in l_node: l_node["codeSnippet"] = {}
                l_node["codeSnippet"][l_id] = cs
            if title:
                if "title" not in l_node: l_node["title"] = {}
                l_node["title"][l_id] = title
        
        if l_node:
            language_data["nodes"][node_id] = l_node

    for child in xml_node.findall("node"):
        extract_node_data(child, node_id)
        
    if diagram is not None:
        for edges_dir in diagram.findall("edges"):
            for edge in edges_dir.findall("edge"):
                edge_id = edge.get("edgeKey")
                if edge_id:
                    e_nav = edge.find("navigation")
                    if e_nav is not None:
                        e_seq = e_nav.find("sequenceIndex")
                        if e_seq is not None and e_seq.text:
                            nav_nodes.append((float(e_seq.text.strip()), edge_id))

                    e_label = edge.get("label")
                    if e_label:
                        clean_e_label = ' '.join(e_label.split()[1:]) if ' ' in e_label else e_label
                        diagram_meta["labelToNodeMap"][clean_e_label] = edge_id
                        diagram_meta["labelToNodeMap"][e_label] = edge_id
                        diagram_meta["nodeToLabelMap"][edge_id] = clean_e_label

                    # Track edge endpoints to assign internal edges to subgraphs
                    direction = edges_dir.get("direction")
                    if direction == "out":
                        edges_list.append({
                            "id": edge_id,
                            "from": node_id,
                            "to": edge.get("to")
                        })
                    elif direction == "in":
                        edges_list.append({
                            "id": edge_id,
                            "from": edge.get("from"),
                            "to": node_id
                        })

                    edge_sidebar = edge.find("sidebar")
                    if edge_sidebar is not None:
                        c_edge = {}
                        c_edge["title"] = inner_xml(edge_sidebar.find("title")) if edge_sidebar.find("title") is not None else ""
                        c_edge["overview"] = inner_xml(edge_sidebar.find("overview")) if edge_sidebar.find("overview") is not None else ""
                        c_edge["handledBy"] = inner_xml(edge_sidebar.find("handledBy")) if edge_sidebar.find("handledBy") is not None else ""
                        c_edge["devImpact"] = inner_xml(edge_sidebar.find("devImpact")) if edge_sidebar.find("devImpact") is not None else ""
                        c_edge["interaction"] = inner_xml(edge_sidebar.find("interaction")) if edge_sidebar.find("interaction") is not None else ""
                        c_edge["branching"] = inner_xml(edge_sidebar.find("branching")) if edge_sidebar.find("branching") is not None else ""
                        c_edge["considerations"] = inner_xml(edge_sidebar.find("considerations")) if edge_sidebar.find("considerations") is not None else ""
                        
                        e_def_pills = edge.find("definitionPills")
                        if e_def_pills is not None:
                            e_pills = []
                            for pill in e_def_pills.findall("definitionRef"):
                                e_pills.append({
                                    "id": pill.get("id"),
                                    "file": pill.get("file")
                                })
                            c_edge["definitionPills"] = e_pills

                        content["nodes"][edge_id] = {k: v for k, v in c_edge.items() if v}
                        
for f in glob.glob("../soap-xml/nodes/*.xml"):
    ntree = ET.parse(f)
    extract_node_data(ntree.getroot())

# Compute internal edges
for edge in edges_list:
    from_sg = diagram_meta["nodeToSubgraphMap"].get(edge["from"])
    to_sg = diagram_meta["nodeToSubgraphMap"].get(edge["to"])
    if from_sg and to_sg and from_sg == to_sg:
        diagram_meta["nodeToSubgraphMap"][edge["id"]] = from_sg

unique_nav = {}
for seq, node_id in nav_nodes:
    unique_nav[node_id] = seq

nav_nodes_list = sorted([(v, k) for k, v in unique_nav.items()])
content["navigationSequence"] = [n[1] for n in nav_nodes_list]
content["diagramMeta"] = diagram_meta

import html
def unescape_dict(d):
    for k, v in d.items():
        if isinstance(v, str):
            d[k] = html.unescape(v)
        elif isinstance(v, dict):
            unescape_dict(v)
        elif isinstance(v, list):
            for i in range(len(v)):
                if isinstance(v[i], str):
                    v[i] = html.unescape(v[i])
                elif isinstance(v[i], dict):
                    unescape_dict(v[i])

# Attach definitions to nodes based on _assignedTo
for d_id, d_data in content["definitions"].items():
    if "_assignedTo" in d_data:
        for target_node in d_data["_assignedTo"]:
            if target_node in content["nodes"]:
                if "definitionPills" not in content["nodes"][target_node]:
                    content["nodes"][target_node]["definitionPills"] = []
                # Avoid duplicates
                existing_pills = [p["id"] for p in content["nodes"][target_node]["definitionPills"]]
                if d_id not in existing_pills:
                    content["nodes"][target_node]["definitionPills"].append({"id": d_id})
        del d_data["_assignedTo"]

unescape_dict(content)
unescape_dict(language_data)

os.makedirs('../dist/data', exist_ok=True)
with open('../dist/data/content.json', 'w') as f:
    json.dump(content, f, indent=2)
    
with open('../dist/data/language-data.json', 'w') as f:
    json.dump(language_data, f, indent=2)

print("JSON data and diagram.mmd generated in ../dist/data/")
