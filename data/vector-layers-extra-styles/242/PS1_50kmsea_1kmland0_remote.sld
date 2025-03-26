<sld:StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:sld="http://www.opengis.net/sld" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0">
  <NamedLayer>
    <Name>Default Styler</Name>
    <UserStyle>
      <Name>Default Styler</Name>
      <Title>A red polygon style</Title>
      <FeatureTypeStyle>
        <Name>name</Name>
        <Rule>
          <Title>red polygon</Title>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#7FFFD4</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke-width">0.5</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</sld:StyledLayerDescriptor>