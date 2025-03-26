<sld:StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:sld="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0.0">
  <NamedLayer>
    <Name>zoning_elements</Name>
    <UserStyle>
      <Name>zoning_elements</Name>
      <Title>zoning_elements</Title>
      <FeatureTypeStyle>
        <Name>name</Name>
        
<Rule>
  <Name>p</Name>
  <Title>Pesca</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0100</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      <CssParameter name="fill">#F4AAAE</CssParameter>
      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>a</Name>
  <Title>Acquacoltura</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>1500</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      <CssParameter name="fill">#B9829F</CssParameter>
      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>tm</Name>
  <Title>Trasporto marittimo e portualità</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0200</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      <CssParameter name="fill">#6E7C97</CssParameter>
      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>n</Name>
  <Title>Protezione ambiente e risorse naturali</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0300</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      <CssParameter name="fill">#88BC91</CssParameter>
      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>e</Name>
  <Title>Energia</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0400</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      <CssParameter name="fill">#C04B4B</CssParameter>
      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>sa</Name>
  <Title>Prelievo di sabbie</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0500</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      <CssParameter name="fill">#FCD154</CssParameter>
      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>d</Name>
  <Title>Difesa</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0600</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      <CssParameter name="fill">#CCAE99</CssParameter>
      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>t</Name>
  <Title>Turismo costiero e marittimo</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0700</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      <CssParameter name="fill">#F4A166</CssParameter>
      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>ppc</Name>
  <Title>Paesaggio e Patrimonio Culturale</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>1000</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      <CssParameter name="fill">#778775</CssParameter>
      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>r</Name>
  <Title>Ricerca scientifica e innovazione</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>1400</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      <CssParameter name="fill">#999999</CssParameter>
      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>s</Name>
  <Title>Sicurezza marittima, della navigazione e sorveglianza</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>1300</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      <CssParameter name="fill">#9C6F69</CssParameter>
      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>dc</Name>
  <Title>Difesa costiera, protezione dalle alluvioni, ripristino della morfologia dei fondali</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>1200</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      <CssParameter name="fill">#999999</CssParameter>
      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>sd</Name>
  <Title>Immersione sedimenti dragati</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>1100</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      <CssParameter name="fill">#999999</CssParameter>
      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>#</Name>
  <Title>Telecomunicazioni</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0900</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      <CssParameter name="fill">#BBC8E4</CssParameter>
      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>generico</Name>
  <Title>Generico</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>tipo</ogc:PropertyName>
      <ogc:Literal>G</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      <CssParameter name="fill">#e3e3e2</CssParameter>
      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>n, t</Name>
  <Title>n, t</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0300,0700</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      
      <GraphicFill>
        <Graphic>
          <ExternalGraphic>
            <OnlineResource xlink:type="simple" xlink:href="zoning_elements_png/leg_0300_0700.png"/>
            <Format>image/png</Format>
          </ExternalGraphic>
          <Size>20</Size>
        </Graphic>
      </GraphicFill>

      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>n, t, a</Name>
  <Title>n, t, a</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0300,0700,1500</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      
      <GraphicFill>
        <Graphic>
          <ExternalGraphic>
            <OnlineResource xlink:type="simple" xlink:href="zoning_elements_png/leg_0300_0700_1500.png"/>
            <Format>image/png</Format>
          </ExternalGraphic>
          <Size>30</Size>
        </Graphic>
      </GraphicFill>

      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>tm, e</Name>
  <Title>tm, e</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0200,0400</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      
      <GraphicFill>
        <Graphic>
          <ExternalGraphic>
            <OnlineResource xlink:type="simple" xlink:href="zoning_elements_png/leg_0200_0400.png"/>
            <Format>image/png</Format>
          </ExternalGraphic>
          <Size>20</Size>
        </Graphic>
      </GraphicFill>

      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>tm, n</Name>
  <Title>tm, n</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0200,0300</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      
      <GraphicFill>
        <Graphic>
          <ExternalGraphic>
            <OnlineResource xlink:type="simple" xlink:href="zoning_elements_png/leg_0200_0300.png"/>
            <Format>image/png</Format>
          </ExternalGraphic>
          <Size>20</Size>
        </Graphic>
      </GraphicFill>

      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>t, a</Name>
  <Title>t, a</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0700,1500</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      
      <GraphicFill>
        <Graphic>
          <ExternalGraphic>
            <OnlineResource xlink:type="simple" xlink:href="zoning_elements_png/leg_0700_1500.png"/>
            <Format>image/png</Format>
          </ExternalGraphic>
          <Size>20</Size>
        </Graphic>
      </GraphicFill>

      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>t, ppc, a</Name>
  <Title>t, ppc, a</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0700,1000,1500</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      
      <GraphicFill>
        <Graphic>
          <ExternalGraphic>
            <OnlineResource xlink:type="simple" xlink:href="zoning_elements_png/leg_0700_1000_1500.png"/>
            <Format>image/png</Format>
          </ExternalGraphic>
          <Size>30</Size>
        </Graphic>
      </GraphicFill>

      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>p, t, a</Name>
  <Title>p, t, a</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0100,0700,1500</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      
      <GraphicFill>
        <Graphic>
          <ExternalGraphic>
            <OnlineResource xlink:type="simple" xlink:href="zoning_elements_png/leg_0100_0700_1500.png"/>
            <Format>image/png</Format>
          </ExternalGraphic>
          <Size>30</Size>
        </Graphic>
      </GraphicFill>

      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>n, t, ppc</Name>
  <Title>n, t, ppc</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0300,0700,1000</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      
      <GraphicFill>
        <Graphic>
          <ExternalGraphic>
            <OnlineResource xlink:type="simple" xlink:href="zoning_elements_png/leg_0300_0700_1000.png"/>
            <Format>image/png</Format>
          </ExternalGraphic>
          <Size>30</Size>
        </Graphic>
      </GraphicFill>

      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>p, tm, t</Name>
  <Title>p, tm, t</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0100,0200,0700</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      
      <GraphicFill>
        <Graphic>
          <ExternalGraphic>
            <OnlineResource xlink:type="simple" xlink:href="zoning_elements_png/leg_0100_0200_0700.png"/>
            <Format>image/png</Format>
          </ExternalGraphic>
          <Size>30</Size>
        </Graphic>
      </GraphicFill>

      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>p, n, t, ppc, a</Name>
  <Title>p, n, t, ppc, a</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0100,0300,0700,1000,1500</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      
      <GraphicFill>
        <Graphic>
          <ExternalGraphic>
            <OnlineResource xlink:type="simple" xlink:href="zoning_elements_png/leg_0100_0300_0700_1000_1500.png"/>
            <Format>image/png</Format>
          </ExternalGraphic>
          <Size>50</Size>
        </Graphic>
      </GraphicFill>

      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>p, e</Name>
  <Title>p, e</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0100,0400</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      
      <GraphicFill>
        <Graphic>
          <ExternalGraphic>
            <OnlineResource xlink:type="simple" xlink:href="zoning_elements_png/leg_0100_0400.png"/>
            <Format>image/png</Format>
          </ExternalGraphic>
          <Size>20</Size>
        </Graphic>
      </GraphicFill>

      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>n, ppc</Name>
  <Title>n, ppc</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0300,1000</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      
      <GraphicFill>
        <Graphic>
          <ExternalGraphic>
            <OnlineResource xlink:type="simple" xlink:href="zoning_elements_png/leg_0300_1000.png"/>
            <Format>image/png</Format>
          </ExternalGraphic>
          <Size>20</Size>
        </Graphic>
      </GraphicFill>

      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>p, tm</Name>
  <Title>p, tm</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0100,0200</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      
      <GraphicFill>
        <Graphic>
          <ExternalGraphic>
            <OnlineResource xlink:type="simple" xlink:href="zoning_elements_png/leg_0100_0200.png"/>
            <Format>image/png</Format>
          </ExternalGraphic>
          <Size>20</Size>
        </Graphic>
      </GraphicFill>

      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>p, a</Name>
  <Title>p, a</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0100,1500</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      
      <GraphicFill>
        <Graphic>
          <ExternalGraphic>
            <OnlineResource xlink:type="simple" xlink:href="zoning_elements_png/leg_0100_1500.png"/>
            <Format>image/png</Format>
          </ExternalGraphic>
          <Size>20</Size>
        </Graphic>
      </GraphicFill>

      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>n, d</Name>
  <Title>n, d</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0300,0600</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      
      <GraphicFill>
        <Graphic>
          <ExternalGraphic>
            <OnlineResource xlink:type="simple" xlink:href="zoning_elements_png/leg_0300_0600.png"/>
            <Format>image/png</Format>
          </ExternalGraphic>
          <Size>20</Size>
        </Graphic>
      </GraphicFill>

      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>p, t, ppc, a</Name>
  <Title>p, t, ppc, a</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0100,0700,1000,1500</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      
      <GraphicFill>
        <Graphic>
          <ExternalGraphic>
            <OnlineResource xlink:type="simple" xlink:href="zoning_elements_png/leg_0100_0700_1000_1500.png"/>
            <Format>image/png</Format>
          </ExternalGraphic>
          <Size>40</Size>
        </Graphic>
      </GraphicFill>

      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>p, ppc, a</Name>
  <Title>p, ppc, a</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0100,1000,1500</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      
      <GraphicFill>
        <Graphic>
          <ExternalGraphic>
            <OnlineResource xlink:type="simple" xlink:href="zoning_elements_png/leg_0100_1000_1500.png"/>
            <Format>image/png</Format>
          </ExternalGraphic>
          <Size>30</Size>
        </Graphic>
      </GraphicFill>

      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>n, s</Name>
  <Title>n, s</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0300,1300</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      
      <GraphicFill>
        <Graphic>
          <ExternalGraphic>
            <OnlineResource xlink:type="simple" xlink:href="zoning_elements_png/leg_0300_1300.png"/>
            <Format>image/png</Format>
          </ExternalGraphic>
          <Size>20</Size>
        </Graphic>
      </GraphicFill>

      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>tm, d</Name>
  <Title>tm, d</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0200,0600</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      
      <GraphicFill>
        <Graphic>
          <ExternalGraphic>
            <OnlineResource xlink:type="simple" xlink:href="zoning_elements_png/leg_0200_0600.png"/>
            <Format>image/png</Format>
          </ExternalGraphic>
          <Size>20</Size>
        </Graphic>
      </GraphicFill>

      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>tm, n, t, ppc</Name>
  <Title>tm, n, t, ppc</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0200,0300,0700,1000</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      
      <GraphicFill>
        <Graphic>
          <ExternalGraphic>
            <OnlineResource xlink:type="simple" xlink:href="zoning_elements_png/leg_0200_0300_0700_1000.png"/>
            <Format>image/png</Format>
          </ExternalGraphic>
          <Size>40</Size>
        </Graphic>
      </GraphicFill>

      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>t, ppc</Name>
  <Title>t, ppc</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0700,1000</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      
      <GraphicFill>
        <Graphic>
          <ExternalGraphic>
            <OnlineResource xlink:type="simple" xlink:href="zoning_elements_png/leg_0700_1000.png"/>
            <Format>image/png</Format>
          </ExternalGraphic>
          <Size>20</Size>
        </Graphic>
      </GraphicFill>

      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>p, n, s</Name>
  <Title>p, n, s</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0100,0300,1300</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      
      <GraphicFill>
        <Graphic>
          <ExternalGraphic>
            <OnlineResource xlink:type="simple" xlink:href="zoning_elements_png/leg_0100_0300_1300.png"/>
            <Format>image/png</Format>
          </ExternalGraphic>
          <Size>30</Size>
        </Graphic>
      </GraphicFill>

      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>d, t, ppc</Name>
  <Title>d, t, ppc</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0600,0700,1000</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      
      <GraphicFill>
        <Graphic>
          <ExternalGraphic>
            <OnlineResource xlink:type="simple" xlink:href="zoning_elements_png/leg_0600_0700_1000.png"/>
            <Format>image/png</Format>
          </ExternalGraphic>
          <Size>30</Size>
        </Graphic>
      </GraphicFill>

      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>p, tm, a</Name>
  <Title>p, tm, a</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0100,0200,1500</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      
      <GraphicFill>
        <Graphic>
          <ExternalGraphic>
            <OnlineResource xlink:type="simple" xlink:href="zoning_elements_png/leg_0100_0200_1500.png"/>
            <Format>image/png</Format>
          </ExternalGraphic>
          <Size>30</Size>
        </Graphic>
      </GraphicFill>

      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>tm, n, s</Name>
  <Title>tm, n, s</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0200,0300,1300</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      
      <GraphicFill>
        <Graphic>
          <ExternalGraphic>
            <OnlineResource xlink:type="simple" xlink:href="zoning_elements_png/leg_0200_0300_1300.png"/>
            <Format>image/png</Format>
          </ExternalGraphic>
          <Size>30</Size>
        </Graphic>
      </GraphicFill>

      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>p, tm, e</Name>
  <Title>p, tm, e</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0100,0200,0400</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      
      <GraphicFill>
        <Graphic>
          <ExternalGraphic>
            <OnlineResource xlink:type="simple" xlink:href="zoning_elements_png/leg_0100_0200_0400.png"/>
            <Format>image/png</Format>
          </ExternalGraphic>
          <Size>30</Size>
        </Graphic>
      </GraphicFill>

      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>tm, sa</Name>
  <Title>tm, sa</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0200,0500</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      
      <GraphicFill>
        <Graphic>
          <ExternalGraphic>
            <OnlineResource xlink:type="simple" xlink:href="zoning_elements_png/leg_0200_0500.png"/>
            <Format>image/png</Format>
          </ExternalGraphic>
          <Size>20</Size>
        </Graphic>
      </GraphicFill>

      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>p, n</Name>
  <Title>p, n</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0100,0300</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      
      <GraphicFill>
        <Graphic>
          <ExternalGraphic>
            <OnlineResource xlink:type="simple" xlink:href="zoning_elements_png/leg_0100_0300.png"/>
            <Format>image/png</Format>
          </ExternalGraphic>
          <Size>20</Size>
        </Graphic>
      </GraphicFill>

      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>p, t, ppc</Name>
  <Title>p, t, ppc</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0100,0700,1000</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      
      <GraphicFill>
        <Graphic>
          <ExternalGraphic>
            <OnlineResource xlink:type="simple" xlink:href="zoning_elements_png/leg_0100_0700_1000.png"/>
            <Format>image/png</Format>
          </ExternalGraphic>
          <Size>30</Size>
        </Graphic>
      </GraphicFill>

      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>p, n, t, ppc</Name>
  <Title>p, n, t, ppc</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0100,0300,0700,1000</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      
      <GraphicFill>
        <Graphic>
          <ExternalGraphic>
            <OnlineResource xlink:type="simple" xlink:href="zoning_elements_png/leg_0100_0300_0700_1000.png"/>
            <Format>image/png</Format>
          </ExternalGraphic>
          <Size>40</Size>
        </Graphic>
      </GraphicFill>

      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>p, t</Name>
  <Title>p, t</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0100,0700</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      
      <GraphicFill>
        <Graphic>
          <ExternalGraphic>
            <OnlineResource xlink:type="simple" xlink:href="zoning_elements_png/leg_0100_0700.png"/>
            <Format>image/png</Format>
          </ExternalGraphic>
          <Size>20</Size>
        </Graphic>
      </GraphicFill>

      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>p, tm, n</Name>
  <Title>p, tm, n</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0100,0200,0300</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      
      <GraphicFill>
        <Graphic>
          <ExternalGraphic>
            <OnlineResource xlink:type="simple" xlink:href="zoning_elements_png/leg_0100_0200_0300.png"/>
            <Format>image/png</Format>
          </ExternalGraphic>
          <Size>30</Size>
        </Graphic>
      </GraphicFill>

      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>tm, a</Name>
  <Title>tm, a</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0200,1500</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      
      <GraphicFill>
        <Graphic>
          <ExternalGraphic>
            <OnlineResource xlink:type="simple" xlink:href="zoning_elements_png/leg_0200_1500.png"/>
            <Format>image/png</Format>
          </ExternalGraphic>
          <Size>20</Size>
        </Graphic>
      </GraphicFill>

      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>


<Rule>
  <Name>p, sa</Name>
  <Title>p, sa</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>0100,0500</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      
      <GraphicFill>
        <Graphic>
          <ExternalGraphic>
            <OnlineResource xlink:type="simple" xlink:href="zoning_elements_png/leg_0100_0500.png"/>
            <Format>image/png</Format>
          </ExternalGraphic>
          <Size>20</Size>
        </Graphic>
      </GraphicFill>

      </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
  
<TextSymbolizer>
  <Label>
    <ogc:PropertyName>label</ogc:PropertyName>
  </Label>
</TextSymbolizer>

</Rule>

      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</sld:StyledLayerDescriptor>