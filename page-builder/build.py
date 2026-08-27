import xml.etree.ElementTree as ET
import glob
import re
import os

from mermaid_generator import generate_mermaid_code

import sys
project_name = sys.argv[1] if len(sys.argv) > 1 else 'soap'

# ---------------------------------------------------------
# 1. GENERATE MERMAID DIAGRAM
# ---------------------------------------------------------
mermaid_code = generate_mermaid_code(project_name)


# ---------------------------------------------------------
# 2. ASSEMBLE HARNESS AND GENERATE JSON DATA
# ---------------------------------------------------------
import json
import shutil
import os



tree = ET.parse(f'../data/{project_name}/PageContent.xml')
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
for f in glob.glob(f"../data/{project_name}/definitions/*.xml"):
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
            "theme": get_text(droot, "theme"),
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

# parse sections via xsltproc
import subprocess
try:
    xslt_result = subprocess.run(
        ["xsltproc", "sections.xslt", f'../data/{project_name}/PageContent.xml'],
        capture_output=True,
        text=True,
        check=True
    )
    content["sectionsHtml"] = xslt_result.stdout.strip()
except Exception as e:
    print("Warning: Failed to run xsltproc:", e)
    content["sectionsHtml"] = ""

# Keep finding defaultLanguage dynamically
sections_node = root.find('sections')
if sections_node is not None:
    first_lang = sections_node.find(".//languages/language")
    if first_lang is not None:
        content["meta"]["defaultLanguage"] = first_lang.get("id")

# parse nodes
diagram_meta = {
    "subgraphs": [],
    "nodeToSubgraphMap": {},
    "labelToNodeMap": {},
    "nodeToLabelMap": {}
}
next_pointers = {}
big_picture_nodes = set()
edges_list = []

def extract_node_data(xml_node, parent_id=None):

    node_id = xml_node.get("id")
    if not node_id: return
    
    label_text = xml_node.get("label") or ""
    c_node = {}
    c_node["title"] = inner_xml(xml_node.find("title")) if xml_node.find("title") is not None else label_text or node_id
    c_node["codeSnippet"] = (xml_node.find("codeSnippet").text or "").strip() if xml_node.find("codeSnippet") is not None else ""
    
    c_node["sections"] = []
    
    # Extract sections from the node directly
    for child in xml_node:
        if child.tag.endswith("Card"):
            c_node["sections"].append({
                "title": child.get("title", ""),
                "theme": child.tag,
                "icon": child.tag.replace("Card", ""),
                "body": inner_xml(child)
            })
            
    # Extract sections from a <sidebar> wrapper (used by edges)
    sidebar = xml_node.find("sidebar")
    if sidebar is not None:
        c_node["title"] = inner_xml(sidebar.find("title")) if sidebar.find("title") is not None else c_node["title"]
        for child in sidebar:
            if child.tag.endswith("Card"):
                c_node["sections"].append({
                    "title": child.get("title", ""),
                    "theme": child.tag,
                    "icon": child.tag.replace("Card", ""),
                    "body": inner_xml(child)
                })
    
    big = xml_node.find("bigPicture")
    if big is not None:
        c_node["isBigPicture"] = True
        c_node["bigPicture"] = {
            "role": inner_xml(big.find("role")),
            "summary": inner_xml(big.find("summary")),
            "whyItExists": inner_xml(big.find("whyItExists")),
            "journeyStep": inner_xml(big.find("journeyStep"))
        }

    # Extract next pointer
    node_next = xml_node.get("next")
    if node_next:
        next_pointers[node_id] = node_next
    if big is not None:
        big_picture_nodes.add(node_id)

    def_pills = xml_node.find("definitionPills")
    if def_pills is not None:
        pills = []
        for pill in def_pills.findall("definitionPill"):
            pills.append({
                "id": pill.get("id")
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
                    e_next = edge.get("next")
                    if e_next:
                        next_pointers[edge_id] = e_next

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
                        c_edge["sections"] = []
                        for child in edge_sidebar:
                            if child.tag.endswith("Card"):
                                c_edge["sections"].append({
                                    "title": child.get("title", ""),
                                    "theme": child.tag,
                                    "icon": child.tag.replace("Card", ""),
                                    "body": inner_xml(child)
                                })
                        
                        e_def_pills = edge.find("definitionPills")
                        if e_def_pills is not None:
                            e_pills = []
                            for pill in e_def_pills.findall("definitionPill"):
                                e_pills.append({
                                    "id": pill.get("id")
                                })
                            c_edge["definitionPills"] = e_pills

                        content["nodes"][edge_id] = {k: v for k, v in c_edge.items() if v}
                        
for f in glob.glob(f"../data/{project_name}/nodes/*.xml"):
    ntree = ET.parse(f)
    extract_node_data(ntree.getroot())

# Compute internal edges
for edge in edges_list:
    from_sg = diagram_meta["nodeToSubgraphMap"].get(edge["from"])
    to_sg = diagram_meta["nodeToSubgraphMap"].get(edge["to"])
    if from_sg and to_sg and from_sg == to_sg:
        diagram_meta["nodeToSubgraphMap"][edge["id"]] = from_sg

# Find start node (in-degree 0 among those that are in next_pointers or are targets)
all_sources = set(next_pointers.keys())
all_targets = set(next_pointers.values())
start_nodes = all_sources - all_targets

if not start_nodes and next_pointers:
    raise ValueError("Circular reference detected with no start node!")
start_node = "Client" if "Client" in start_nodes else (list(start_nodes)[0] if start_nodes else None)

nav_seq = []
current = start_node
visited = set()

while current:
    if current in visited:
        raise ValueError(f"Circular reference detected at node {current}!")
    visited.add(current)
    
    # Inject big picture node right BEFORE the node itself if it has one
    if current in big_picture_nodes:
        nav_seq.append(current + "_BigPicture")
        
    nav_seq.append(current)
    
    current = next_pointers.get(current)
    
    # Strict check for missing IDs
    if current:
        valid_node = current in content["nodes"]
        valid_edge = any(e["id"] == current for e in edges_list)
        is_big_picture = current.endswith("_BigPicture")
        if not (valid_node or valid_edge or is_big_picture):
            raise ValueError(f"Build broken: Missing next ID reference '{current}' in the XML graph!")

content["navigationSequence"] = nav_seq
if nav_seq:
    content["meta"]["initialNodeId"] = nav_seq[0]

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

def create_definition_xml(def_id, word, project_name):
    path = f'../data/{project_name}/definitions/{def_id}.xml'
    if not os.path.exists(path):
        xml_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<definition id="{def_id}">
  <icon>📖</icon>
  <label>{word}</label>
  <body>Auto-generated definition for {word}.</body>
</definition>
'''
        with open(path, 'w') as f:
            f.write(xml_content)
        
        idx_path = f'../data/{project_name}/definitions/_definitions.xml'
        if os.path.exists(idx_path):
            with open(idx_path, 'r') as idx_f:
                idx_content = idx_f.read()
            if f'id="{def_id}"' not in idx_content:
                entry = f'''
  <definition
    id="{def_id}"
    icon="📖"
    label="{word}"
    file="{project_name}/data/definitions/{def_id}.xml"
  />
</definitions>'''
                idx_content = idx_content.replace('</definitions>', entry)
                with open(idx_path, 'w') as idx_f:
                    idx_f.write(idx_content)

def process_text_for_defs(text, definitions_dict, project_name):
    if not isinstance(text, str): return text
    pattern = r'<def\s+id="([^"]+)">([^<]+)</def>'
    def replacer(match):
        def_id = match.group(1)
        word = match.group(2)
        if def_id not in definitions_dict:
            create_definition_xml(def_id, word, project_name)
            definitions_dict[def_id] = {
                "icon": "📖",
                "label": word,
                "body": f"Auto-generated definition for {word}."
            }
        return match.group(0)
    return re.sub(pattern, replacer, text)

def replace_def_tags_in_dict(d, definitions_dict, project_name):
    for k, v in d.items():
        if isinstance(v, str):
            d[k] = process_text_for_defs(v, definitions_dict, project_name)
        elif isinstance(v, dict):
            replace_def_tags_in_dict(v, definitions_dict, project_name)
        elif isinstance(v, list):
            for i in range(len(v)):
                if isinstance(v[i], str):
                    v[i] = process_text_for_defs(v[i], definitions_dict, project_name)
                elif isinstance(v[i], dict):
                    replace_def_tags_in_dict(v[i], definitions_dict, project_name)

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

replace_def_tags_in_dict(content, content["definitions"], project_name)
replace_def_tags_in_dict(language_data, content["definitions"], project_name)

os.makedirs(f'../site/data/{project_name}', exist_ok=True)
with open(f'../site/data/{project_name}/content.json', 'w') as f:
    json.dump(content, f, indent=2)
    
with open(f'../site/data/{project_name}/language-data.json', 'w') as f:
    json.dump(language_data, f, indent=2)

print(f"JSON data and diagram.mmd generated in ../site/data/{project_name}/")
