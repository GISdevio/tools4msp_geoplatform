<sld:StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:sld="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0.0">
  <NamedLayer>
    <Name>zoning_elements_energia</Name>
    <UserStyle>
      <Name>zoning_elements_energia</Name>
      <Title>zoning_elements_energia</Title>
      <FeatureTypeStyle>
        <Name>name</Name>

<Rule>
  <Name>prioritario</Name>
  <Title>Riservato, limitato, prioritario</Title>
  <ogc:Filter>
    <ogc:PropertyIsLike wildCard="*" singleChar="." escape="#">
      <ogc:PropertyName>u_p</ogc:PropertyName>
      <ogc:Literal>*0400*</ogc:Literal>
    </ogc:PropertyIsLike>
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
</Rule>
        
<Rule>
  <Name>altro_uso</Name>
  <Title>Aree consentite salvo fattibilità o diverse 
specifiche limitazioni e regolamentazioni</Title>
  <ogc:Filter>
    <ogc:PropertyIsLike wildCard="*" singleChar="." escape="#">
      <ogc:PropertyName>u_a</ogc:PropertyName>
      <ogc:Literal>*0400*</ogc:Literal>
    </ogc:PropertyIsLike>
  </ogc:Filter>
  <PolygonSymbolizer>
    <Fill>
           <GraphicFill>
             <Graphic>
               <Mark>
                 <WellKnownName>x</WellKnownName>
                 <Stroke>
                   <CssParameter name="stroke">#C04B4B</CssParameter>
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