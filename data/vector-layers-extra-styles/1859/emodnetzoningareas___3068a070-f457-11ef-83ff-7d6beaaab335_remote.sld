<sld:StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:sld="http://www.opengis.net/sld" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0">
  <NamedLayer>
    <Name>mspzoningareas</Name>
    <UserStyle>
      <Name>mspzoningareas</Name>
      <FeatureTypeStyle>

        <Rule>
          <Name>Aquaculture</Name>
          <Description>
            <Title>Aquaculture</Title>
          </Description>
          <ogc:Filter>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>seausename</ogc:PropertyName>
                <ogc:Literal>Aquaculture</ogc:Literal>
              </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#dce3c1</CssParameter>
              <CssParameter name="fill-opacity">0.8</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#ffc90e</CssParameter>
              <CssParameter name="stroke-width">0.5</CssParameter>
              <CssParameter name="stroke-linejoin">bevel</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>

        <Rule>
          <Name>Boundaries</Name>
          <Description>
            <Title>Boundaries</Title>
          </Description>
          <ogc:Filter>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>seausename</ogc:PropertyName>
                <ogc:Literal>Boundaries</ogc:Literal>
              </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#BA9685</CssParameter>
              <CssParameter name="fill-opacity">0.8</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#ffc90e</CssParameter>
              <CssParameter name="stroke-width">0.5</CssParameter>
              <CssParameter name="stroke-linejoin">bevel</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>


        <Rule>
          <Name>Cables</Name>
          <Description>
            <Title>Cables</Title>
          </Description>
          <ogc:Filter>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>seausename</ogc:PropertyName>
                <ogc:Literal>Cables</ogc:Literal>
              </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#908cba</CssParameter>
              <CssParameter name="fill-opacity">0.8</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#ffc90e</CssParameter>
              <CssParameter name="stroke-width">0.5</CssParameter>
              <CssParameter name="stroke-linejoin">bevel</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>

        <Rule>
          <Name>Cultural heritage</Name>
           <Description>
            <Title>Cultural heritage</Title>
          </Description>
          <ogc:Filter>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>seausename</ogc:PropertyName>
                <ogc:Literal>Cultural heritage</ogc:Literal>
              </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#adc0e0</CssParameter>
              <CssParameter name="fill-opacity">0.8</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#ffc90e</CssParameter>
              <CssParameter name="stroke-width">0.5</CssParameter>
              <CssParameter name="stroke-linejoin">bevel</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>

        <Rule>
          <Name>Disposal areas</Name>
           <Description>
            <Title>Disposal areas</Title>
          </Description>
          <ogc:Filter>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>seausename</ogc:PropertyName>
                <ogc:Literal>Disposal areas</ogc:Literal>
              </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#ff8c33</CssParameter>
              <CssParameter name="fill-opacity">0.8</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#ffc90e</CssParameter>
              <CssParameter name="stroke-width">0.5</CssParameter>
              <CssParameter name="stroke-linejoin">bevel</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>

        <Rule>
          <Name>Fishing areas</Name>
          <Description>
            <Title>Fishing areas</Title>
          </Description>
          <ogc:Filter>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>seausename</ogc:PropertyName>
                <ogc:Literal>Fishing areas</ogc:Literal>
              </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#a6d99a</CssParameter>
              <CssParameter name="fill-opacity">0.8</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#ffc90e</CssParameter>
              <CssParameter name="stroke-width">0.5</CssParameter>
              <CssParameter name="stroke-linejoin">bevel</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>

        <Rule>
          <Name>Maritime Traffic flows</Name>
          <Description>
            <Title>Maritime Traffic flows</Title>
          </Description>
          <ogc:Filter>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>seausename</ogc:PropertyName>
                <ogc:Literal>Maritime Traffic flows</ogc:Literal>
              </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#fd5b78</CssParameter>
              <CssParameter name="fill-opacity">0.8</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#ffc90e</CssParameter>
              <CssParameter name="stroke-width">0.5</CssParameter>
              <CssParameter name="stroke-linejoin">bevel</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>

        <Rule>
          <Name>Military areas</Name>
           <Description>
            <Title>Military areas</Title>
          </Description>
          <ogc:Filter>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>seausename</ogc:PropertyName>
                <ogc:Literal>Military areas</ogc:Literal>
              </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#fe94a7</CssParameter>
              <CssParameter name="fill-opacity">0.8</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#ffc90e</CssParameter>
              <CssParameter name="stroke-width">0.5</CssParameter>
              <CssParameter name="stroke-linejoin">bevel</CssParameter>
            </Stroke>
          </PolygonSymbolizer>

        </Rule>

        <Rule>
          <Name>Nature Protection Conservation</Name>
          <Description>
            <Title>Nature Protection Conservation</Title>
          </Description>
          <ogc:Filter>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>seausename</ogc:PropertyName>
                <ogc:Literal>Nature Protection Conservation</ogc:Literal>
              </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#aac48f</CssParameter>
              <CssParameter name="fill-opacity">0.8</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#ffc90e</CssParameter>
              <CssParameter name="stroke-width">0.5</CssParameter>
              <CssParameter name="stroke-linejoin">bevel</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>

        <Rule>
          <Name>Ocean Energy Facilities</Name>
          <Description>
            <Title>Ocean Energy Facilities</Title>
          </Description>
          <ogc:Filter>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>seausename</ogc:PropertyName>
                <ogc:Literal>Ocean Energy Facilities</ogc:Literal>
              </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#a1e3cc</CssParameter>
              <CssParameter name="fill-opacity">0.8</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#ffc90e</CssParameter>
              <CssParameter name="stroke-width">0.5</CssParameter>
              <CssParameter name="stroke-linejoin">bevel</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>

       	<Rule>
          <Name>Oil and Gas</Name>
          <Description>
            <Title>Oil and Gas</Title>
          </Description>
          <ogc:Filter>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>seausename</ogc:PropertyName>
                <ogc:Literal>Oil and Gas</ogc:Literal>
              </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#ffe1ca</CssParameter>
              <CssParameter name="fill-opacity">0.8</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#ffc90e</CssParameter>
              <CssParameter name="stroke-width">0.5</CssParameter>
              <CssParameter name="stroke-linejoin">bevel</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>

        <Rule>
          <Name>Other/miscellaneous</Name>
           <Description>
            <Title>Other/miscellaneous</Title>
          </Description>
          <ogc:Filter>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>seausename</ogc:PropertyName>
                <ogc:Literal>Other/miscellaneous</ogc:Literal>
              </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#bae3e2</CssParameter>
              <CssParameter name="fill-opacity">0.8</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#ffc90e</CssParameter>
              <CssParameter name="stroke-width">0.5</CssParameter>
              <CssParameter name="stroke-linejoin">bevel</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>

        <Rule>
          <Name>Pipelines</Name>
          <Description>
            <Title>Pipelines</Title>
          </Description>
          <ogc:Filter>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>seausename</ogc:PropertyName>
                <ogc:Literal>Pipelines</ogc:Literal>
              </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#f8b3ff</CssParameter>
              <CssParameter name="fill-opacity">0.8</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#ffc90e</CssParameter>
              <CssParameter name="stroke-width">0.5</CssParameter>
              <CssParameter name="stroke-linejoin">bevel</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>

        <Rule>
          <Name>Ports</Name>
          <Description>
            <Title>Ports</Title>
          </Description>
          <ogc:Filter>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>seausename</ogc:PropertyName>
                <ogc:Literal>Ports</ogc:Literal>
              </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#b1e3c2</CssParameter>
              <CssParameter name="fill-opacity">0.8</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#ffc90e</CssParameter>
              <CssParameter name="stroke-width">0.5</CssParameter>
              <CssParameter name="stroke-linejoin">bevel</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>

        <Rule>
          <Name>Raw material extraction</Name>
          <Description>
            <Title>Raw material extraction</Title>
          </Description>
          <ogc:Filter>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>seausename</ogc:PropertyName>
                <ogc:Literal>Raw material extraction</ogc:Literal>
              </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#b9d1ff</CssParameter>
              <CssParameter name="fill-opacity">0.8</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#ffc90e</CssParameter>
              <CssParameter name="stroke-width">0.5</CssParameter>
              <CssParameter name="stroke-linejoin">bevel</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>

        <Rule>
          <Name>Scientific research</Name>
          <Description>
            <Title>Scientific research</Title>
          </Description>
          <ogc:Filter>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>seausename</ogc:PropertyName>
                <ogc:Literal>Scientific research</ogc:Literal>
              </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#ba9685</CssParameter>
              <CssParameter name="fill-opacity">0.8</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#ffc90e</CssParameter>
              <CssParameter name="stroke-width">0.5</CssParameter>
              <CssParameter name="stroke-linejoin">bevel</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>

        <Rule>
          <Name>Tourism and recreation</Name>
          <Description>
            <Title>Tourism and recreation</Title>
          </Description>
          <ogc:Filter>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>seausename</ogc:PropertyName>
                <ogc:Literal>Tourism and recreation</ogc:Literal>
              </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#75a6ff</CssParameter>
              <CssParameter name="fill-opacity">0.8</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#ffc90e</CssParameter>
              <CssParameter name="stroke-width">0.5</CssParameter>
              <CssParameter name="stroke-linejoin">bevel</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>

        <Rule>
          <Name>Wind Farms</Name>
          <Description>
            <Title>Wind Farms</Title>
          </Description>
          <ogc:Filter>
              <ogc:PropertyIsEqualTo>
                <ogc:PropertyName>seausename</ogc:PropertyName>
                <ogc:Literal>Wind Farms</ogc:Literal>
              </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#bebebe</CssParameter>
              <CssParameter name="fill-opacity">0.8</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#ffc90e</CssParameter>
              <CssParameter name="stroke-width">0.5</CssParameter>
              <CssParameter name="stroke-linejoin">bevel</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>

      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</sld:StyledLayerDescriptor>