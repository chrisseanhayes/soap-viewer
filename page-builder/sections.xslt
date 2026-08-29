<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" indent="yes" omit-xml-declaration="yes"/>


  <!-- Start processing only from sections -->
  <xsl:template match="/">
    <xsl:apply-templates select="page/sections"/>
  </xsl:template>

  <xsl:template match="sections">
    <div class="sections-wrapper">
      <xsl:apply-templates select="section"/>
    </div>
  </xsl:template>

  <xsl:template match="section">
    <section class="p-6 rounded-lg shadow-sm border bg-white border-slate-200 mb-8">
      <h2 class="text-xl font-semibold mb-4 text-slate-800 flex items-center gap-2">
        <xsl:apply-templates select="heading/node()"/>
      </h2>
      
      <xsl:if test="intro">
         <div class="text-sm space-y-4 text-slate-600 mb-4">
           <p><xsl:apply-templates select="intro/node()"/></p>
         </div>
      </xsl:if>

      <xsl:if test="subsections">
        <xsl:choose>
          <xsl:when test="subsections/@layout='grid'">
            <div class="grid md:grid-cols-2 gap-6 text-sm text-slate-600 mt-4">
              <xsl:apply-templates select="subsections/subsection"/>
            </div>
          </xsl:when>
          <xsl:otherwise>
            <div class="grid md:grid-cols-2 gap-6 text-sm text-slate-600">
              <xsl:apply-templates select="subsections/subsection"/>
            </div>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:if>
      
      <!-- Render any direct subsections that aren't inside <subsections> (e.g. leakyAbstraction) -->
      <xsl:apply-templates select="subsection"/>
      
      <xsl:if test="languages">
        <div class="languages-wrapper mt-6">
           <xsl:apply-templates select="languages/language"/>
        </div>
      </xsl:if>
    </section>
  </xsl:template>

  <xsl:template match="subsection">
    <xsl:choose>
      <xsl:when test="@layout='horizontal'">
        <div class="mt-4 p-4 rounded-lg border flex items-start gap-3 theme-target" data-theme="{@theme}">
          <div class="theme-icon-placeholder flex-shrink-0 mt-0.5" data-icon="warning" data-icon-size="w-6 h-6"></div>
          <div>
            <strong class="block mb-1 text-xl font-semibold text-slate-800"><xsl:apply-templates select="heading/node()"/></strong>
            <p class="text-sm text-slate-600"><xsl:apply-templates select="body/node()"/></p>
          </div>
        </div>
      </xsl:when>
      <xsl:when test="@theme">
        <div class="p-5 rounded-lg border theme-target" data-theme="{@theme}">
          <h4 class="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-800">
            <div class="theme-icon-placeholder" data-theme="{@theme}"></div>
            <xsl:apply-templates select="heading/node()"/>
          </h4>
          <p class="mb-3"><xsl:apply-templates select="body/node()"/></p>
          <xsl:if test="bullets">
            <ul class="list-disc pl-5 space-y-1.5 text-sm mt-3">
              <xsl:for-each select="bullets/bullet">
                <li><xsl:apply-templates select="node()"/></li>
              </xsl:for-each>
            </ul>
          </xsl:if>
        </div>
      </xsl:when>
      <xsl:otherwise>
        <div class="mb-4">
          <h3 class="font-bold mb-2 border-b pb-1 text-slate-800">
            <xsl:apply-templates select="heading/node()"/>
          </h3>
          <p><xsl:apply-templates select="body/node()"/></p>
          
          <xsl:if test="bullets">
            <ul class="list-disc pl-5 space-y-1.5 text-sm mt-3">
              <xsl:for-each select="bullets/bullet">
                <li><xsl:apply-templates select="node()"/></li>
              </xsl:for-each>
            </ul>
          </xsl:if>
        </div>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="language">
    <div class="language-block hidden" data-lang="{@id}">
      <xsl:if test="facadeCode">
        <pre class="p-4 rounded-md text-sm overflow-x-auto font-mono shadow-inner bg-slate-900 text-slate-50 mt-4"><code><xsl:value-of select="facadeCode"/></code></pre>
      </xsl:if>
      
      <xsl:if test="heading or body or code">
        <div class="p-5 rounded-lg border border-slate-200 mt-4 bg-slate-50">
          <xsl:if test="heading">
            <h4 class="font-bold mb-2 flex items-center gap-2 text-slate-800">
              <span class="w-2 h-2 {@dotColor} rounded-full"></span>
              <xsl:apply-templates select="heading/node()"/>
            </h4>
          </xsl:if>
          <xsl:if test="body">
            <p class="mb-3 text-slate-600"><xsl:apply-templates select="body/node()"/></p>
          </xsl:if>
          <xsl:if test="code">
            <pre class="p-4 rounded-md text-xs overflow-x-auto font-mono shadow-inner bg-slate-900 text-slate-50"><code><xsl:value-of select="code"/></code></pre>
          </xsl:if>
        </div>
      </xsl:if>
      
      <xsl:if test="cicd">
        <div class="mt-4 p-4 rounded-lg border flex items-start gap-3 bg-purple-50 border-purple-100">
           <!-- gear icon -->
           <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path><circle cx="12" cy="12" r="3"></circle></svg>
           <div>
             <strong class="block mb-1 text-slate-800"><xsl:apply-templates select="cicd/title/node()"/></strong>
             <span class="text-slate-600"><xsl:apply-templates select="cicd/body/node()"/></span>
           </div>
        </div>
      </xsl:if>
    </div>
  </xsl:template>

  <!-- Pass through def elements exactly as they are -->
  <xsl:template match="def">
    <def id="{@id}">
      <xsl:value-of select="."/>
    </def>
  </xsl:template>

  <!-- Pass through formatting tags -->
  <xsl:template match="strong|em|code|b|i">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()"/>
    </xsl:copy>
  </xsl:template>

</xsl:stylesheet>
