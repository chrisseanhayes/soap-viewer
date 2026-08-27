import xml.etree.ElementTree as ET
import glob

def generate_mermaid_code(project_name="soap"):
    # Pre-defined app-level styles
    class_defs = {
        "osiLayer": "fill:#f3f4f6,stroke:#94a3b8,stroke-width:2px,stroke-dasharray:5 5",
        "process": "fill:#e0f2fe,stroke:#0ea5e9,stroke-width:2px",
        "clickable": "cursor:pointer,transition:all 0.2s",
        "soapResponse": "fill:#f0fdf4,stroke:#16a34a,stroke-width:2px",
        "soapLayer": "fill:#fef3c7,stroke:#d97706,stroke-width:2px"
    }
    edges_out = []
    click_handlers = []


    def get_full_text(element):
        if element is None: return ""
        text = element.text or ""
        for child in element:
            text += get_full_text(child)
            text += child.tail or ""
        return text.strip()

    def escape_label_edge(label):
        if not label: return ""
        return f"{label}"

    def escape_label_node(label):
        if not label: return ""
        return f"{label}"

    def parse_node(xml_node, depth=0):
        node_id = xml_node.get("id")
        label = xml_node.get("label")
        diagram_class = xml_node.get("diagramClass")
        
        diagram = xml_node.find("diagram")
        indent = "  " * depth
        out = ""
        
        if diagram is not None:
            # LEAF NODE
            leaf_label = get_full_text(diagram.find("nodeLabel")) or ""
            leaf_id = get_full_text(diagram.find("nodeId")) or node_id
            
            is_clickable = False
            classes_tags = diagram.findall("classes/class")
            for c in classes_tags:
                c_name = c.get("name")
                if c_name == "clickable":
                    is_clickable = True
                c_style = c.get("style")
                if c_style:
                    c_style = c_style.replace(";", ",")
                    if c_style.endswith(","): c_style = c_style[:-1]
                    class_defs[c_name] = c_style
                # Instead of :::class1:::class2, we use class Node class1
                click_handlers.append(f"class {leaf_id} {c_name}")
                
            out += f"{indent}{leaf_id}[{escape_label_node(leaf_label)}]\n"
            
            if is_clickable:
                import re
                clean_label = re.sub(r'^.*?[\d\.]+\s*', '', leaf_label).strip()
                if not clean_label:
                    clean_label = leaf_label
                click_handlers.append(f'click {leaf_id} call showDetails() "Details on {clean_label}"')
                
            for edges_dir in diagram.findall("edges"):
                if edges_dir.get("direction") == "out":
                    for edge in edges_dir.findall("edge"):
                        to = edge.get("to")
                        e_label = edge.get("label") or ""
                        e_type = edge.get("type")
                        
                        arrow = "-->"
                        if e_type == "solid-line": arrow = "---"
                        elif e_type == "dotted-arrow": arrow = "-.->"
                        elif e_type == "dotted-line": arrow = "-.-"
                        
                        label_str = f"|{escape_label_edge(e_label)}|" if e_label else ""
                        edges_out.append(f"{leaf_id} {arrow}{label_str} {to}")
                        
        else:
            # SUBGRAPH CONTAINER
            children = xml_node.findall("node")
            if children:
                # Subgraph title should not have quotes for compatibility with older mermaid, use brackets
                out += f"{indent}subgraph {node_id} [{escape_label_node(label)}]\n"
                if diagram_class:
                    click_handlers.append(f"class {node_id} {diagram_class}")
                    
                for child in children:
                    out += parse_node(child, depth + 1)
                out += f"{indent}end\n"
                
        return out

    mermaid_code = "graph TD\n"
    for f in glob.glob(f"../data/{project_name}/nodes/*.xml"):
        tree = ET.parse(f)
        mermaid_code += parse_node(tree.getroot(), 0) + "\n"

    for c_name, c_style in class_defs.items():
        if c_style: mermaid_code += f"classDef {c_name} {c_style}\n"

    mermaid_code += "\n"
    for e in edges_out: mermaid_code += f"{e}\n"
    mermaid_code += "\n"
    for c in click_handlers: mermaid_code += f"{c}\n"

    # Write standalone MMD just in case
    import os
    os.makedirs(f"../site/data/{project_name}", exist_ok=True)
    with open(f"../site/data/{project_name}/diagram.mmd", "w") as f:
        f.write(mermaid_code)

    return mermaid_code
