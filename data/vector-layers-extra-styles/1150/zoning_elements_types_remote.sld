<sld:StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:sld="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0.0">
  <NamedLayer>
    <Name>zoning_elements_types</Name>
    <UserStyle>
      <Name>zoning_elements_types</Name>
      <Title>zoning_elements_types</Title>
      <FeatureTypeStyle>
        <Name>name</Name>

<Rule>
  <Name>riservato</Name>
  <Title>Riservato</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>tipo</ogc:PropertyName>
      <ogc:Literal>R</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      <CssParameter name="fill">#e02531</CssParameter>
      </Fill>
      <Stroke>
        <CssParameter name="stroke">#bbbbbb</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
</Rule>

<Rule>
  <Name>limitato</Name>
  <Title>Limitato</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>tipo</ogc:PropertyName>
      <ogc:Literal>L</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      <CssParameter name="fill">#adc9c9</CssParameter>
      </Fill>
      <Stroke>
        <CssParameter name="stroke">#bbbbbb</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
</Rule>

<Rule>
  <Name>prioritario</Name>
  <Title>Prioritario</Title>
  <ogc:Filter>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>tipo</ogc:PropertyName>
      <ogc:Literal>P</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
      <CssParameter name="fill">#86e56e</CssParameter>
      </Fill>
      <Stroke>
        <CssParameter name="stroke">#bbbbbb</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
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
        <CssParameter name="stroke">#bbbbbb</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
</Rule>

      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</sld:StyledLayerDescriptor>