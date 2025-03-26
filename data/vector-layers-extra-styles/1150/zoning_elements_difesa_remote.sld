<sld:StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:sld="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0.0">
  <NamedLayer>
    <Name>zoning_elements_difesa</Name>
    <UserStyle>
      <Name>zoning_elements_difesa</Name>
      <Title>zoning_elements_difesa</Title>
      <FeatureTypeStyle>
        <Name>name</Name>

<Rule>
  <Name>prioritario</Name>
  <Title>Riservato, limitato, prioritario</Title>
  <ogc:Filter>
    <ogc:PropertyIsLike wildCard="*" singleChar="." escape="#">
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>*0600*</ogc:Literal>
    </ogc:PropertyIsLike>
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
</Rule>
        
<Rule>
  <Name>altro_uso</Name>
  <Title>Aree consentite salvo fattibilità o diverse 
specifiche limitazioni e regolamentazioni</Title>
  <ogc:Filter>
    <ogc:PropertyIsLike wildCard="*" singleChar="." escape="#">
      <ogc:PropertyName>u_a</ogc:PropertyName>
      <ogc:Literal>*0600*</ogc:Literal>
    </ogc:PropertyIsLike>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
           <GraphicFill>
             <Graphic>
               <Mark>
                 <WellKnownName>x</WellKnownName>
                 <Stroke>
                   <CssParameter name="stroke">#CCAE99</CssParameter>
                   <CssParameter name="stroke-width">1</CssParameter>
                 </Stroke>
               </Mark>
               <Size>10</Size>
             </Graphic>
           </GraphicFill>
    </Fill>
      <Stroke>
        <CssParameter name="stroke">#777777</CssParameter>
        <CssParameter name="stroke-width">0.7</CssParameter>
      </Stroke>
  </PolygonSymbolizer>
</Rule>
        
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</sld:StyledLayerDescriptor>