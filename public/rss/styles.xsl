<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <title><xsl:value-of select="/rss/channel/title"/> — RSS</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style>
          /* Colours derived from steel theme (src/styles/tokens/colours.css) */
          *{box-sizing:border-box;margin:0;padding:0}
          body{font-family:system-ui,sans-serif;max-width:640px;margin:3rem auto;padding:0 1rem;line-height:1.5;color:#f5f2eb;background:#2a2e37}
          h1{font-size:1.25rem;margin-bottom:.5rem}
          .desc{color:#9a9a9a;margin-bottom:1.5rem}
          .note{background:#353a45;border:1px solid #4a4f5a;padding:1rem;margin-bottom:2rem;border-radius:4px;font-size:.875rem}
          .note code{background:#2a2e37;padding:.125rem .375rem;border-radius:2px;border:1px solid #4a4f5a}
          .item{border-bottom:1px solid #4a4f5a;padding:1rem 0}
          .item:last-child{border-bottom:none}
          .item-title{font-weight:600;color:#f5f2eb;text-decoration:none}
          .item-title:hover{text-decoration:underline}
          .item-date{color:#9a9a9a;font-size:.75rem;margin-top:.25rem}
          .item-desc{margin-top:.5rem;font-size:.875rem}
        </style>
      </head>
      <body>
        <h1><xsl:value-of select="/rss/channel/title"/></h1>
        <p class="desc"><xsl:value-of select="/rss/channel/description"/></p>
        <div class="note">This is an RSS feed. Copy this URL into your reader: <code><xsl:value-of select="/rss/channel/link"/>rss.xml</code></div>
        <xsl:for-each select="/rss/channel/item">
          <article class="item">
            <a class="item-title" href="{link}"><xsl:value-of select="title"/></a>
            <p class="item-date"><xsl:value-of select="pubDate"/></p>
            <p class="item-desc"><xsl:value-of select="description"/></p>
          </article>
        </xsl:for-each>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
