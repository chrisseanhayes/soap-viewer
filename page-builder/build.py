import xml.etree.ElementTree as ET
import glob
import re
import os

# ---------------------------------------------------------
# 1. GENERATE MERMAID DIAGRAM
# ---------------------------------------------------------
class_defs = {}
edges_out = []
click_handlers = []

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
        leaf_label = diagram.findtext("nodeLabel") or ""
        leaf_id = diagram.findtext("nodeId") or node_id
        
        classes_tags = diagram.findall("classes/class")
        for c in classes_tags:
            c_name = c.get("name")
            c_style = c.get("style").replace(";", ",")
            if c_style.endswith(","): c_style = c_style[:-1]
            class_defs[c_name] = c_style
            # Instead of :::class1:::class2, we use class Node class1
            click_handlers.append(f"class {leaf_id} {c_name}")
            
        out += f"{indent}{leaf_id}[{escape_label_node(leaf_label)}]\n"
        
        click_handler = diagram.findtext("clickHandler")
        if click_handler:
            click_handlers.append(f"click {leaf_id} {click_handler}")
            
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
                # Add default fallback style for container if not defined
                if diagram_class not in class_defs:
                    class_defs[diagram_class] = "fill:#f3f4f6,stroke:#94a3b8,stroke-width:2px,stroke-dasharray:5 5"
                click_handlers.append(f"class {node_id} {diagram_class}")
                
            for child in children:
                out += parse_node(child, depth + 1)
            out += f"{indent}end\n"
            
    return out

mermaid_code = "graph TD\n"
for f in glob.glob("../soap-xml/nodes/*.xml"):
    tree = ET.parse(f)
    mermaid_code += parse_node(tree.getroot(), 0) + "\n"

for c_name, c_style in class_defs.items():
    if c_style: mermaid_code += f"classDef {c_name} {c_style}\n"

mermaid_code += "\n"
for e in edges_out: mermaid_code += f"{e}\n"
mermaid_code += "\n"
for c in click_handlers: mermaid_code += f"{c}\n"

# Write standalone MMD just in case
with open("../dist/diagram.mmd", "w") as f:
    f.write(mermaid_code)


# ---------------------------------------------------------
# 2. GENERATE PAGE HTML
# ---------------------------------------------------------
tree = ET.parse('../soap-xml/PageContent.xml')
root = tree.getroot()

def get_text(parent, path):
    el = parent.find(path)
    return el.text.strip() if el is not None and el.text else ""

def inner_xml(element):
    if element is None: return ""
    return (element.text or "") + "".join(ET.tostring(child, encoding='unicode') for child in element)

meta = root.find('meta')
title = get_text(meta, 'title')
subtitle = get_text(meta, 'subtitle')
diagram_hint = get_text(meta, 'diagramHint')

sections = root.find('sections')

# Section 1
sec1 = sections.find("section[@id='understandingLayers']")
sec1_heading = get_text(sec1, 'heading')
sec1_sub1 = sec1.find("subsections/subsection[@id='osi7']")
sec1_sub2 = sec1.find("subsections/subsection[@id='proxy']")

# Section 2
sec2 = sections.find("section[@id='proxyPattern']")
sec2_heading = inner_xml(sec2.find('heading'))
sec2_intro = inner_xml(sec2.find('intro'))
sec2_sub1 = sec2.find("subsections/subsection[@id='developerView']")
sec2_sub2 = sec2.find("subsections/subsection[@id='hiddenComplexity']")
sec2_sub3 = sec2.find("subsections/subsection[@id='leakyAbstraction']")

bullets_html = "".join([f"                            <li>{inner_xml(b)}</li>\n" for b in sec2_sub2.findall("bullets/bullet")])

facades_html = ""
for i, lang in enumerate(sec2.find("languages").findall("language")):
    l_id = lang.get("id")
    l_code = inner_xml(lang.find("facadeCode")).strip()
    hidden = "" if i == 0 else "hidden"
    facades_html += f'''
                        <div id="facade-{l_id}" class="facade-code {hidden}">
                            <pre class="bg-slate-800 text-green-400 p-4 rounded-md text-sm overflow-x-auto font-mono shadow-inner"><code>{l_code}</code></pre>
                        </div>'''

# Section 3
sec3 = sections.find("section[@id='tooling']")
sec3_heading = inner_xml(sec3.find('heading'))
sec3_intro = inner_xml(sec3.find('intro'))

tooling_html = ""
for i, lang in enumerate(sec3.find("languages").findall("language")):
    l_id = lang.get("id")
    l_dot = lang.get("dotColor") or "bg-slate-500"
    l_heading = inner_xml(lang.find("heading"))
    l_body = inner_xml(lang.find("body"))
    l_code = inner_xml(lang.find("code")).strip()
    hidden = "" if i == 0 else "hidden"
    tooling_html += f'''
                <div id="tooling-{l_id}" class="tooling-content {hidden} mt-6 animate-fade-in">
                    <div class="bg-slate-50 p-5 rounded-lg border border-slate-200">
                        <h4 class="font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <span class="w-2 h-2 {l_dot} rounded-full"></span>
                            {l_heading}
                        </h4>
                        <p class="mb-3">{l_body}</p>
                        <pre class="bg-slate-800 text-green-400 p-4 rounded-md text-xs overflow-x-auto font-mono shadow-inner"><code>{l_code}</code></pre>
                    </div>
                </div>'''

cicd = sec3.find("languages/language/cicd")
cicd_title = inner_xml(cicd.find("title"))
cicd_body = inner_xml(cicd.find("body"))

template = f'''<html lang="en"><head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .mermaid-container {{ min-height: 600px; display: flex; align-items: center; justify-content: center; }}
    </style>
</head>
<body class="bg-slate-50">

    <div id="app-root">
        <!-- HEADER -->
        <div class="w-full bg-white border-b border-slate-200 py-3 px-4 md:px-6 shadow-sm">
            <header class="max-w-[96rem] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div class="text-center md:text-left">
                    <h1 class="text-2xl md:text-3xl font-bold text-slate-900 mb-1">{title}</h1>
                    <div class="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                        <p class="text-sm text-slate-600">{subtitle}</p>
                        <span class="hidden md:inline text-slate-300">|</span>
                        <p class="text-xs text-blue-600 font-medium">{diagram_hint}</p>
                    </div>
                </div>
            </header>
        </div>

        <!-- DIAGRAM AND SIDEBAR SECTION -->
        <div class="w-full bg-slate-50 border-b border-slate-200">
            <div class="w-full p-2 md:p-6 max-w-[96rem] mx-auto">
                <div class="flex flex-col lg:flex-row gap-6 h-[75vh] min-h-[600px]">
                    <!-- Diagram -->
                    <main class="mermaid-container w-full lg:w-3/4 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden relative">
                        <pre class="mermaid w-full h-full">
{mermaid_code}
                        </pre>
                    </main>
                    <!-- Sidebar Placeholder -->
                    <aside class="w-full lg:w-1/4 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col h-full">
                        <div class="p-4 border-b border-slate-100 bg-slate-50 rounded-t-lg">
                            <h2 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <span class="truncate">Component Details</span>
                            </h2>
                        </div>
                        <div class="p-6 flex-grow flex items-center justify-center text-slate-400 text-sm text-center">
                            Hover over a node to view its generated details (Sidebar integration pending).
                        </div>
                    </aside>
                </div>
            </div>
        </div>

        <!-- PAGE CONTENT SECTIONS -->
        <div class="max-w-5xl mx-auto p-6 md:p-12 space-y-8">
            <section class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h2 class="text-xl font-semibold mb-4 text-slate-800">{sec1_heading}</h2>
                <div class="grid md:grid-cols-2 gap-6 text-sm text-slate-600">
                    <div>
                        <h3 class="font-bold text-slate-800 mb-2 border-b pb-1">{inner_xml(sec1_sub1.find('heading'))}</h3>
                        <p>{inner_xml(sec1_sub1.find('body'))}</p>
                    </div>
                    <div>
                        <h3 class="font-bold text-slate-800 mb-2 border-b pb-1">{inner_xml(sec1_sub2.find('heading'))}</h3>
                        <p>{inner_xml(sec1_sub2.find('body'))}</p>
                    </div>
                </div>
            </section>

            <section class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h2 class="text-xl font-semibold mb-4 text-slate-800">{sec2_heading}</h2>
                <div class="text-sm text-slate-600 space-y-4">
                    <p>{sec2_intro}</p>

                    <div class="grid md:grid-cols-2 gap-6 mt-4">
                        <div class="bg-slate-50 p-5 rounded-lg border border-slate-200">
                            <h4 class="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                {inner_xml(sec2_sub1.find('heading'))}
                            </h4>
                            <p class="mb-4">{inner_xml(sec2_sub1.find('body'))}</p>
                            {facades_html}
                        </div>

                        <div class="bg-blue-50 p-5 rounded-lg border border-blue-100">
                            <h4 class="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                {inner_xml(sec2_sub2.find('heading'))}
                            </h4>
                            <p class="mb-3">{inner_xml(sec2_sub2.find('body'))}</p>
                            <ul class="list-disc pl-5 space-y-1.5 text-sm">
{bullets_html}                            </ul>
                        </div>
                    </div>

                    <div class="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200 flex items-start gap-3">
                        <div>
                            <strong class="text-slate-900 block mb-1">{inner_xml(sec2_sub3.find('heading'))}</strong>
                            {inner_xml(sec2_sub3.find('body'))}
                        </div>
                    </div>
                </div>
            </section>

            <section class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h2 class="text-xl font-semibold mb-4 text-slate-800 flex items-center gap-2">
                    {sec3_heading}
                </h2>
                <div class="text-sm text-slate-600 space-y-4">
                    <p>{sec3_intro}</p>
{tooling_html}
                    <div class="mt-4 p-4 bg-slate-100 rounded-lg border border-slate-200 text-slate-700 flex items-start gap-3">
                        <div>
                            <strong id="cicd-title" class="text-slate-900 block mb-1">{cicd_title}</strong>
                            <span id="cicd-text">{cicd_body}</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>

    <!-- MERMAID SCRIPT FOR DYNAMIC RENDERING -->
    <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
        mermaid.initialize({{ 
            startOnLoad: true, 
            theme: 'base',
            themeVariables: {{
                primaryColor: '#eff6ff',
                primaryTextColor: '#1e293b',
                primaryBorderColor: '#3b82f6',
                lineColor: '#64748b',
                secondaryColor: '#f0fdf4',
                tertiaryColor: '#fef2f2'
            }},
            securityLevel: 'loose'
        }});
    </script>
</body>
</html>
'''

template = template.replace("&lt;", "<").replace("&gt;", ">")

with open('../dist/index.html', 'w') as f:
    f.write(template)

print("Unified index.html with live Mermaid rendering generated in ../dist/")
