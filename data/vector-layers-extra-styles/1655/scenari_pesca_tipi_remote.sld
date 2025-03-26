<sld:StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:sld="http://www.opengis.net/sld" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0">
  <NamedLayer>
    <Name>Pesca</Name>
    <UserStyle>
      <Name>Pesca</Name>
      <FeatureTypeStyle>
        <Name>name</Name>
        <Rule>
          <Name>Aree di rilevanza per la pesca artigianale</Name>
          <Title>Aree di rilevanza per la pesca artigianale</Title>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>usedescit</ogc:PropertyName>
              <ogc:Literal>Aree di rilevanza per la pesca artigianale</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#e7a81f</CssParameter>
              <CssParameter name="fill-opacity">0.58</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#fe5b03</CssParameter>
              <CssParameter name="stroke-linejoin">bevel</CssParameter>
              <CssParameter name="stroke-width">2</CssParameter>
              <CssParameter name="stroke-dasharray">1.0 2.0</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>
         <Rule>
          <Name>Protezione aree di nursery</Name>
          <Title>Protezione aree di nursery</Title>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>usedescit</ogc:PropertyName>
              <ogc:Literal>Protezione aree di nursery</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#baee3c</CssParameter>
              <CssParameter name="fill-opacity">0.6</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#ff4500</CssParameter>
              <CssParameter name="stroke-linejoin">bevel</CssParameter>
              <CssParameter name="stroke-width">1</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>
        <Rule>
          <Name>Divieto pesca a strascico 0-50/0-3 MN</Name>
          <Title>Divieto pesca a strascico 0-50/0-3 MN</Title>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>usedescit</ogc:PropertyName>
              <ogc:Literal>Divieto pesca a strascico 0-50/0-3 MN</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#e15631</CssParameter>
              <CssParameter name="fill-opacity">0.13</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#c42a2a</CssParameter>
              <CssParameter name="stroke-linejoin">bevel</CssParameter>
              <CssParameter name="stroke-opacity">0.9</CssParameter>
              <CssParameter name="stroke-dasharray">4.0 2.0</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>
        <Rule>
          <Name>Divieto pesca a strascico 0-50/0-4 MN</Name>
          <Title>Divieto pesca a strascico 0-50/0-4 MN</Title>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>usedescit</ogc:PropertyName>
              <ogc:Literal>Divieto pesca a strascico 0-50/0-4 MN</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#a72953</CssParameter>
              <CssParameter name="fill-opacity">0.23</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#531e29</CssParameter>
              <CssParameter name="stroke-linejoin">bevel</CssParameter>
              <CssParameter name="stroke-opacity">0.9</CssParameter>
              <CssParameter name="stroke-dasharray">4.0 2.0</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>
        <Rule>
          <Name>Divieto pesca a strascico 3-4 MN nel periodo estivo</Name>
          <Title>Divieto pesca a strascico 3-4 MN nel periodo estivo</Title>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>usedescit</ogc:PropertyName>
              <ogc:Literal>Divieto pesca a strascico 3-4 MN nel periodo estivo</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PolygonSymbolizer>
            <Fill>
              <GraphicFill>
                <Graphic>
                  <Mark>
                    <WellKnownName>shape://slash</WellKnownName>
                    <Stroke>
                      <CssParameter name="stroke">#d773c0</CssParameter>
                      <CssParameter name="stroke-opacity">0.35</CssParameter>
                      <CssParameter name="stroke-width">3</CssParameter>
                    </Stroke>
                  </Mark>
                  <Size>7</Size>
                  <Rotation>45.0</Rotation>
                </Graphic>
              </GraphicFill>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#cf64bb</CssParameter>
              <CssParameter name="stroke-linecap">square</CssParameter>
              <CssParameter name="stroke-linejoin">bevel</CssParameter>
              <CssParameter name="stroke-dasharray">6.0 5.0</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>
         <Rule>
          <Name>Divieto pesca a strascico 4-6 MN nel periodo estivo</Name>
          <Title>Divieto pesca a strascico 4-6 MN nel periodo estivo</Title>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>usedescit</ogc:PropertyName>
              <ogc:Literal>Divieto pesca a strascico 4-6 MN nel periodo estivo</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PolygonSymbolizer>
            <Fill>
              <GraphicFill>
                <Graphic>
                  <Mark>
                    <WellKnownName>shape://slash</WellKnownName>
                    <Stroke>
                      <CssParameter name="stroke">#d773c0</CssParameter>
                      <CssParameter name="stroke-opacity">0.35</CssParameter>
                      <CssParameter name="stroke-width">2</CssParameter>
                    </Stroke>
                  </Mark>
                  <Size>12</Size>
                  <Rotation>45.0</Rotation>
                </Graphic>
              </GraphicFill>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#cf64bb</CssParameter>
              <CssParameter name="stroke-linecap">square</CssParameter>
              <CssParameter name="stroke-linejoin">bevel</CssParameter>
              <CssParameter name="stroke-dasharray">8.0 5.0</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>
        <Rule>
          <Name>Divieto pesca a strascico 6 MN nel periodo estivo</Name>
          <Title>Divieto pesca a strascico 6 MN nel periodo estivo</Title>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>usedescit</ogc:PropertyName>
              <ogc:Literal>Divieto pesca a strascico 6 MN nel periodo estivo</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PolygonSymbolizer>
            <Fill>
              <GraphicFill>
                <Graphic>
                  <Mark>
                    <WellKnownName>shape://slash</WellKnownName>
                    <Stroke>
                      <CssParameter name="stroke">#d773c0</CssParameter>
                      <CssParameter name="stroke-opacity">0.35</CssParameter>
                      <CssParameter name="stroke-width">2</CssParameter>
                    </Stroke>
                  </Mark>
                  <Size>12</Size>
                  <Rotation>0</Rotation>
                </Graphic>
              </GraphicFill>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#cf64bb</CssParameter>
              <CssParameter name="stroke-linecap">square</CssParameter>
              <CssParameter name="stroke-linejoin">bevel</CssParameter>
              <CssParameter name="stroke-dasharray">8.0 5.0</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>
        <Rule>
          <Name>Divieto pesca FSRU</Name>
          <Title>Divieto pesca FSRU</Title>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>usedescit</ogc:PropertyName>
              <ogc:Literal>Divieto pesca FSRU</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PolygonSymbolizer>
            <Fill>
              <GraphicFill>
                <Graphic>
                  <Mark>
                    <WellKnownName>shape://slash</WellKnownName>
                    <Stroke>
                      <CssParameter name="stroke">#e4001b</CssParameter>
                      <CssParameter name="stroke-opacity">0.65</CssParameter>
                      <CssParameter name="stroke-width">2</CssParameter>
                    </Stroke>
                  </Mark>
                  <Size>7</Size>
                  <Rotation>90.0</Rotation>
                </Graphic>
              </GraphicFill>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#cf64bb</CssParameter>
              <CssParameter name="stroke-linecap">square</CssParameter>
              <CssParameter name="stroke-linejoin">bevel</CssParameter>
            </Stroke>
			</PolygonSymbolizer>
        </Rule>
        <Rule>
          <Name>FRA divieto pesca a strascico 800-1000 m</Name>
          <Title>FRA divieto pesca a strascico 800-1000 m</Title>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>usedescit</ogc:PropertyName>
              <ogc:Literal>FRA divieto pesca a strascico 800-1000 m</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#6e6a68</CssParameter>
              <CssParameter name="fill-opacity">0.46</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#bd0000</CssParameter>
              <CssParameter name="stroke-linejoin">bevel</CssParameter>
              <CssParameter name="stroke-opacity">0.9</CssParameter>
              <CssParameter name="stroke-width">0.4</CssParameter>
              <CssParameter name="stroke-dasharray">6.0 3.0</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>
        <Rule>
          <Name>FRA divieto pesca a strascico sotto i 1000 m</Name>
          <Title>FRA divieto pesca a strascico sotto i 1000 m</Title>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>usedescit</ogc:PropertyName>
              <ogc:Literal>FRA divieto pesca a strascico sotto i 1000 m</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#bfaa8a</CssParameter>
              <CssParameter name="fill-opacity">0.20</CssParameter>
            </Fill>
          </PolygonSymbolizer>
        </Rule>
        <Rule>
          <Name>FRA nuova</Name>
          <Title>FRA nuova</Title>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>usedescit</ogc:PropertyName>
              <ogc:Literal>FRA nuova</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PolygonSymbolizer>
            <Fill>
              <GraphicFill>
                <Graphic>
                  <Mark>
                    <WellKnownName>shape://slash</WellKnownName>
                    <Stroke>
                      <CssParameter name="stroke">#0700d4</CssParameter>
                      <CssParameter name="stroke-opacity">0.4</CssParameter>
                      <CssParameter name="stroke-width">3</CssParameter>
                    </Stroke>
                  </Mark>
                  <Size>8</Size>
                </Graphic>
              </GraphicFill>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#4311cc</CssParameter>
              <CssParameter name="stroke-linecap">square</CssParameter>
              <CssParameter name="stroke-linejoin">bevel</CssParameter>
              <CssParameter name="stroke-dasharray">2.0 3.0</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>
        <Rule>
          <Name>FRA esistente</Name>
          <Title>FRA esistente</Title>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>usedescit</ogc:PropertyName>
              <ogc:Literal>FRA esistente</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#e1619f</CssParameter>
              <CssParameter name="fill-opacity">0.46</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#d02c0b</CssParameter>
              <CssParameter name="stroke-linejoin">bevel</CssParameter>
              <CssParameter name="stroke-opacity">0.84</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>
        <Rule>
          <Name>ZTB - FRA nuova</Name>
          <Title>ZTB - FRA nuova</Title>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>usedescit</ogc:PropertyName>
              <ogc:Literal>ZTB nuova</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#b58e46</CssParameter>
              <CssParameter name="fill-opacity">0.44</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#007b33</CssParameter>
              <CssParameter name="stroke-linejoin">bevel</CssParameter>
              <CssParameter name="stroke-opacity">0.8</CssParameter>
              <CssParameter name="stroke-dasharray">4.0 2.0</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>
        <Rule>
          <Name>ZTB esistente</Name>
          <Title>ZTB esistente</Title>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>usedescit</ogc:PropertyName>
              <ogc:Literal>ZTB esistente</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#a5ba46</CssParameter>
              <CssParameter name="fill-opacity">0.23</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#a87c1e</CssParameter>
              <CssParameter name="stroke-linejoin">bevel</CssParameter>
              <CssParameter name="stroke-opacity">0.9</CssParameter>
              <CssParameter name="stroke-dasharray">4.0 2.0 1.0 2.0</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</sld:StyledLayerDescriptor>