<StyledLayerDescriptor version="1.0.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <NamedLayer>
    <Name>GNS SSF GSA16 (Fishing operation/year)</Name>
    <UserStyle>
      <Name>GNS SSF GSA16 (Fishing operation/year)</Name>
      <Title>GNS SSF GSA16 (Fishing operation/year)</Title>
      <FeatureTypeStyle>
        <Rule>
          <Name>1 - 100</Name>
          <ogc:Filter xmlns="http://www.opengis.net/ogc">
            <And>
              <PropertyIsGreaterThanOrEqualTo>
                <PropertyName>gns_tot</PropertyName>
                <Literal>1</Literal>
              </PropertyIsGreaterThanOrEqualTo>
              <PropertyIsLessThanOrEqualTo>
                <PropertyName>gns_tot</PropertyName>
                <Literal>100</Literal>
              </PropertyIsLessThanOrEqualTo>
            </And>
          </ogc:Filter>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#3a528b</CssParameter>
            </Fill>
          </PolygonSymbolizer>
        </Rule>
        <Rule>
          <Name>100 - 180</Name>
          <ogc:Filter xmlns="http://www.opengis.net/ogc">
            <And>
              <PropertyIsGreaterThan>
                <PropertyName>gns_tot</PropertyName>
                <Literal>100</Literal>
              </PropertyIsGreaterThan>
              <PropertyIsLessThanOrEqualTo>
                <PropertyName>gns_tot</PropertyName>
                <Literal>180</Literal>
              </PropertyIsLessThanOrEqualTo>
            </And>
          </ogc:Filter>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#20908d</CssParameter>
            </Fill>
          </PolygonSymbolizer>
        </Rule>
        <Rule>
          <Name>180 - 700</Name>
          <ogc:Filter xmlns="http://www.opengis.net/ogc">
            <And>
              <PropertyIsGreaterThan>
                <PropertyName>gns_tot</PropertyName>
                <Literal>180</Literal>
              </PropertyIsGreaterThan>
              <PropertyIsLessThanOrEqualTo>
                <PropertyName>gns_tot</PropertyName>
                <Literal>700</Literal>
              </PropertyIsLessThanOrEqualTo>
            </And>
          </ogc:Filter>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#5dc962</CssParameter>
            </Fill>
          </PolygonSymbolizer>
        </Rule>
        <Rule>
          <Name>700 - 2450</Name>
          <ogc:Filter xmlns="http://www.opengis.net/ogc">
            <And>
              <PropertyIsGreaterThan>
                <PropertyName>gns_tot</PropertyName>
                <Literal>700</Literal>
              </PropertyIsGreaterThan>
              <PropertyIsLessThanOrEqualTo>
                <PropertyName>gns_tot</PropertyName>
                <Literal>2450</Literal>
              </PropertyIsLessThanOrEqualTo>
            </And>
          </ogc:Filter>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#fde725</CssParameter>
            </Fill>
          </PolygonSymbolizer>
        </Rule>
        <Rule>
          <Name>GNS SSF GSA16 (Fishing operation/year)</Name>
          <TextSymbolizer>
            <Label/>
            <Font>
              <CssParameter name="font-size">14</CssParameter>
              <CssParameter name="font-style">normal</CssParameter>
              <CssParameter name="font-weight">normal</CssParameter>
            </Font>
            <LabelPlacement>
              <PointPlacement>
                <Displacement>
                  <DisplacementX>0</DisplacementX>
                  <DisplacementY>0</DisplacementY>
                </Displacement>
              </PointPlacement>
            </LabelPlacement>
            <Fill>
              <CssParameter name="fill">#333333</CssParameter>
            </Fill>
            <Halo>
              <Radius>1</Radius>
              <Fill>
                <CssParameter name="fill">#ffffff</CssParameter>
              </Fill>
            </Halo>
          </TextSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>