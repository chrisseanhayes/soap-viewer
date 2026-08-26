import xml.etree.ElementTree as ET
import glob
import json
import os

def get_text(parent, path):
    el = parent.find(path)
    return el.text.strip() if el is not None and el.text else ""

def inner_xml(element):
    if element is None: return ""
    return (element.text or "") + "".join(ET.tostring(child, encoding='unicode') for child in element)

def parse_all():
    tree = ET.parse('../soap-xml/PageContent.xml')
    root = tree.getroot()
    
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
        "nodes": {}
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
            "heading": inner_xml(sec1.find("subsections/subsection[@id='osi7']/heading")).strip(),
            "body": inner_xml(sec1.find("subsections/subsection[@id='osi7']/body")).strip()
        },
        "proxy": {
            "heading": inner_xml(sec1.find("subsections/subsection[@id='proxy']/heading")).strip(),
            "body": inner_xml(sec1.find("subsections/subsection[@id='proxy']/body")).strip()
        }
    }
    
    sec2 = sections.find("section[@id='proxyPattern']")
    content["sections"]["proxyPattern"] = {
        "heading": inner_xml(sec2.find('heading')).strip(),
        "intro": inner_xml(sec2.find('intro')).strip(),
        "developerView": {
            "heading": inner_xml(sec2.find("subsections/subsection[@id='developerView']/heading")).strip(),
            "body": inner_xml(sec2.find("subsections/subsection[@id='developerView']/body")).strip()
        },
        "hiddenComplexity": {
            "heading": inner_xml(sec2.find("subsections/subsection[@id='hiddenComplexity']/heading")).strip(),
            "body": inner_xml(sec2.find("subsections/subsection[@id='hiddenComplexity']/body")).strip(),
            "bullets": [inner_xml(b).strip() for b in sec2.findall("subsections/subsection[@id='hiddenComplexity']/bullets/bullet")]
        },
        "leakyAbstraction": {
            "heading": inner_xml(sec2.find("subsections/subsection[@id='leakyAbstraction']/heading")).strip(),
            "body": inner_xml(sec2.find("subsections/subsection[@id='leakyAbstraction']/body")).strip()
        }
    }
    
    for lang in sec2.findall("languages/language"):
        l_id = lang.get("id")
        language_data["facades"][l_id] = inner_xml(lang.find("facadeCode")).strip()
        
    sec3 = sections.find("section[@id='tooling']")
    content["sections"]["tooling"] = {
        "heading": inner_xml(sec3.find('heading')).strip(),
        "intro": inner_xml(sec3.find('intro')).strip()
    }
    
    for lang in sec3.findall("languages/language"):
        l_id = lang.get("id")
        language_data["tooling"][l_id] = {
            "dotColor": lang.get("dotColor") or "bg-slate-500",
            "heading": inner_xml(lang.find("heading")).strip(),
            "body": inner_xml(lang.find("body")).strip(),
            "code": inner_xml(lang.find("code")).strip()
        }
        cicd = lang.find("cicd")
        if cicd is not None:
            language_data["cicd"][l_id] = {
                "title": inner_xml(cicd.find("title")).strip(),
                "body": inner_xml(cicd.find("body")).strip()
            }

    # parse nodes
    def extract_node_data(xml_node):
        node_id = xml_node.get("id")
        if not node_id: return
        
        # content.nodes[node_id]
        c_node = {}
        c_node["title"] = inner_xml(xml_node.find("title")).strip() if xml_node.find("title") is not None else xml_node.get("label") or node_id
        c_node["overview"] = inner_xml(xml_node.find("overview")).strip() if xml_node.find("overview") is not None else ""
        c_node["handledBy"] = inner_xml(xml_node.find("handledBy")).strip() if xml_node.find("handledBy") is not None else ""
        c_node["devImpact"] = inner_xml(xml_node.find("devImpact")).strip() if xml_node.find("devImpact") is not None else ""
        c_node["interaction"] = inner_xml(xml_node.find("interaction")).strip() if xml_node.find("interaction") is not None else ""
        c_node["branching"] = inner_xml(xml_node.find("branching")).strip() if xml_node.find("branching") is not None else ""
        c_node["considerations"] = inner_xml(xml_node.find("considerations")).strip() if xml_node.find("considerations") is not None else ""
        c_node["codeSnippet"] = inner_xml(xml_node.find("codeSnippet")).strip() if xml_node.find("codeSnippet") is not None else ""
        
        # Look in <sidebar> if present
        sidebar = xml_node.find("sidebar")
        if sidebar is not None:
            c_node["title"] = inner_xml(sidebar.find("title")).strip() if sidebar.find("title") is not None else c_node["title"]
            c_node["overview"] = inner_xml(sidebar.find("overview")).strip() if sidebar.find("overview") is not None else c_node["overview"]
            c_node["handledBy"] = inner_xml(sidebar.find("handledBy")).strip() if sidebar.find("handledBy") is not None else c_node["handledBy"]
            c_node["devImpact"] = inner_xml(sidebar.find("devImpact")).strip() if sidebar.find("devImpact") is not None else c_node["devImpact"]
            c_node["interaction"] = inner_xml(sidebar.find("interaction")).strip() if sidebar.find("interaction") is not None else c_node["interaction"]
            c_node["branching"] = inner_xml(sidebar.find("branching")).strip() if sidebar.find("branching") is not None else c_node["branching"]
            c_node["considerations"] = inner_xml(sidebar.find("considerations")).strip() if sidebar.find("considerations") is not None else c_node["considerations"]
        
        big = xml_node.find("bigPicture")
        if big is not None:
            c_node["bigPicture"] = {
                "role": inner_xml(big.find("role")).strip(),
                "summary": inner_xml(big.find("summary")).strip(),
                "whyItExists": inner_xml(big.find("whyItExists")).strip(),
                "journeyStep": inner_xml(big.find("journeyStep")).strip()
            }

        # Filter out empty strings
        content["nodes"][node_id] = {k: v for k, v in c_node.items() if v}
        
        # language_data.nodes[node_id]
        langs = xml_node.find("languages")
        if langs is not None:
            l_node = {}
            for lang in langs.findall("language"):
                l_id = lang.get("id")
                di = inner_xml(lang.find("devImpact")).strip() if lang.find("devImpact") is not None else None
                cs = inner_xml(lang.find("codeSnippet")).strip() if lang.find("codeSnippet") is not None else None
                title = inner_xml(lang.find("title")).strip() if lang.find("title") is not None else None
                
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
            extract_node_data(child)
            
        diagram = xml_node.find("diagram")
        if diagram is not None:
            for edges_dir in diagram.findall("edges"):
                for edge in edges_dir.findall("edge"):
                    edge_id = edge.get("edgeKey")
                    if edge_id:
                        edge_sidebar = edge.find("sidebar")
                        if edge_sidebar is not None:
                            c_edge = {}
                            c_edge["title"] = inner_xml(edge_sidebar.find("title")).strip() if edge_sidebar.find("title") is not None else ""
                            c_edge["overview"] = inner_xml(edge_sidebar.find("overview")).strip() if edge_sidebar.find("overview") is not None else ""
                            c_edge["handledBy"] = inner_xml(edge_sidebar.find("handledBy")).strip() if edge_sidebar.find("handledBy") is not None else ""
                            c_edge["devImpact"] = inner_xml(edge_sidebar.find("devImpact")).strip() if edge_sidebar.find("devImpact") is not None else ""
                            c_edge["interaction"] = inner_xml(edge_sidebar.find("interaction")).strip() if edge_sidebar.find("interaction") is not None else ""
                            c_edge["branching"] = inner_xml(edge_sidebar.find("branching")).strip() if edge_sidebar.find("branching") is not None else ""
                            c_edge["considerations"] = inner_xml(edge_sidebar.find("considerations")).strip() if edge_sidebar.find("considerations") is not None else ""
                            content["nodes"][edge_id] = {k: v for k, v in c_edge.items() if v}
                            
    for f in glob.glob("../soap-xml/nodes/*.xml"):
        ntree = ET.parse(f)
        extract_node_data(ntree.getroot())

    os.makedirs('../dist/data', exist_ok=True)
    
    # helper for unescaping html entities that inner_xml keeps escaped
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
    
    unescape_dict(content)
    unescape_dict(language_data)
    
    with open('../dist/data/content.json', 'w') as f:
        json.dump(content, f, indent=2)
        
    with open('../dist/data/language-data.json', 'w') as f:
        json.dump(language_data, f, indent=2)

if __name__ == '__main__':
    parse_all()
