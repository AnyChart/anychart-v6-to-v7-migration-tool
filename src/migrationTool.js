(function(window) {
  'use strict';

  /**
   * Returns true if the specified value is not undefined.
   * @param {*} value Variable to test.
   * @return {boolean} Whether variable is defined.
   */
  var isDef = function(value) {
    // void 0 always evaluates to undefined and hence we do not need to depend on
    // the definition of the global variable named 'undefined'.
    return value !== void 0;
  };

  /**
   * Returns true if the specified value is null.
   * @param {*} value Variable to test.
   * @return {boolean} Whether variable is null.
   */
  var isNull = function(value) {
    return value === null;
  };

  /**
   * Returns true if the specified value is a string.
   * @param {?} value Variable to test.
   * @return {boolean} Whether variable is a string.
   */
  var isString = function(value) {
    return typeof value == 'string';
  };

  /**
   * Returns true if the specified value is an array.
   * @param {?} value Variable to test.
   * @return {boolean} Whether variable is an array.
   */
  var isArray = function(value) {
    return (typeof value == 'object' && value instanceof Array);
  };

  /**
   * Returns true if the specified value is an object and not a function neither array.
   * @param {?} value Variable to test.
   * @return {boolean} Whether variable is an object.
   */
  var isObject = function(value) {
    var type = typeof value;
    return (type == 'object' && type != 'function' && value != null)
  };

  /**
   * Returns true if the specified value is a function.
   * @param {?} value Variable to test.
   * @return {boolean} Whether variable is a function.
   */
  var isFunction = function(value) {
    return (typeof value == 'function' && (typeof value.call != 'undefined'));
  };

  /**
   * Trims all whitespace from the both sides of the string.
   * @param {string} str source string.
   * @return {string} trimmed string.
   */
  var trim = function(str) {
    // Since IE doesn't include non-breaking-space (0xa0) in their \s character
    // class (as required by section 7.2 of the ECMAScript spec), we explicitly
    // include it in the regexp to enforce consistent cross-browser behavior.
    return str.replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
  };

  /**
   * Converts string from underscore_case to camelCase (e. g. from
   * "multi_part_string" to "multiPartString"), useful for converting
   * XML node names to their equivalent JS properties.
   * @param {string} str The string in underscore_case form.
   * @return {string} The string in camelCase form.
   */
  var toCamelCase = function(str) {
    return str.replace(/_([0-9a-z])/g, function(match, p1) {
      return p1.toUpperCase();
    });
  };

  /**
   * Unescapes string.
   * @param {string} str String to unescape.
   * @return {string} Unescaped string.
   */
  var unescapeString = function(str) {
    return str.replace(/\\([0bfnrt"'\\]|x([0-9a-fA-F]{2})|u([0-9a-fA-F]{4}))/g, function(match, sym, hex, utf) {
      var c = sym.charAt(0);
      switch (c) {
        case '0':
          return '\0';
        case 'b':
          return '\b';
        case 'f':
          return '\f';
        case 'n':
          return '\n';
        case 'r':
          return '\r';
        case 't':
          return '\t';
        case '"':
          return '"';
        case '\'':
          return '\'';
        case '\\':
          return '\\';
        case 'x':
          return String.fromCharCode(parseInt(hex, 16));
        case 'u':
          return String.fromCharCode(parseInt(utf, 16));
      }
    });
  };

  var anychart = window.anychart = window.anychart || {};
  anychart.migrationTool = {};

  /**
   * Sets value to object property.
   * @param {Object} obj Object.
   * @param {string|Array.<string>} path Path to object property.
   * @param {*} value Value to set.
   * @return {*} Modified object.
   */
  anychart.migrationTool.setValueByPath = function(obj, path, value) {
    if (isString(path))
      path = path.split('.');

    if (isDef(value)) {
      var curr = isObject(obj) ? obj : {};
      var result = curr;
      for (var i = 0; i < path.length - 1; i++) {
        var key = path[i];
        if (!isObject(curr[key]))
          curr[key] = {};
        curr = curr[key];
      }
      curr[path[path.length - 1]] = value;
      return result;
    } else {
      return obj;
    }
  };

  /**
   * Gets value of the property.
   * @param {Object} obj Object.
   * @param {string|Array.<string>} path Path to object property.
   * @return {*} Value of the property.
   */
  anychart.migrationTool.getValueByPath = function(obj, path) {
    if (isString(path))
      path = path.split('.');

    var result = obj;
    for (var i = 0; i < path.length; i++) {
      if (isObject(result))
        result = result[path[i]];
      else
        return (void 0);
    }
    return result;
  };

  /**
   * Transforms attributes of given object via map of transformation.
   * @param {Object} obj Object.
   * @param {Object.<string, string>|Function} transformationMapOrFunction Map of transformations
   */
  anychart.migrationTool.transformAttributes = function(obj, transformationMapOrFunction) {
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var newKey;
      if (isFunction(transformationMapOrFunction))
        newKey = transformationMapOrFunction(key);
      else if (key in transformationMapOrFunction)
        newKey = transformationMapOrFunction[key];
      else
        newKey = key;
      obj[newKey] = obj[key];
      if (newKey !== key)
        delete obj[key];
    }
    return obj;
  };

  anychart.migrationTool.mixin = function(target, source) {
    for (var key in source) {
      target[key] = source[key];
    }
  };

  /**
   * Is node with specified name allowed to be null.
   * @param {string} name Node name.
   * @return {boolean} Allowed or not.
   */
  var isNullNodeAllowed = function(name) {
    return name == 'point';
  };

  /**
   * XML node types enumeration.
   * @enum {number}
   */
  var XMLNodeType = {
    ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 2,
    TEXT_NODE: 3,
    CDATA_SECTION_NODE: 4,
    ENTITY_REFERENCE_NODE: 5,
    ENTITY_NODE: 6,
    PROCESSING_INSTRUCTION_NODE: 7,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9,
    DOCUMENT_TYPE_NODE: 10,
    DOCUMENT_FRAGMENT_NODE: 11,
    NOTATION_NODE: 12
  };

  /**
   * Parse xml to json.
   * @param {Node} node Node.
   * @return {?(Object|string)} JSON.
   */
  var parseXML = function(node) {
    switch (node.nodeType) {
      case XMLNodeType.ELEMENT_NODE:
        var result = {};
        var multiProp = {};
        var i, name, len, onlyText = true;

        len = node.childNodes.length;
        var textValue = '';
        // collecting subnodes
        for (i = 0; i < len; i++) {
          var childNode = node.childNodes[i];
          var subnode = parseXML(childNode);
          var subNodeName = childNode.nodeName;

          if (subNodeName.charAt(0) == '#' && !isNull(subnode)) {
            textValue += subnode;
          } else if (!isNull(subnode) || isNullNodeAllowed(subNodeName)) {
            onlyText = false;
            name = toCamelCase(subNodeName);
            if (name in result) {
              if (multiProp[name]) {
                result[name].push(subnode);
              } else {
                result[name] = [result[name], subnode];
                multiProp[name] = true;
              }
            } else {
              result[name] = subnode
            }
          }
        }

        len = (node.attributes == null) ? 0 : node.attributes.length;
        // collecting attributes
        for (i = 0; i < len; i++) {
          /** @type {Attr} */
          var attr = node.attributes[i];
          name = toCamelCase(attr.nodeName);
          if (!(name in result)) {
            var val = attr.value;
            if (val == '')
              result[name] = val;
            else if (!isNaN(+val))
              result[name] = +val;
            else if (val.toLowerCase() == 'true')
              result[name] = true;
            else if (val.toLowerCase() == 'false')
              result[name] = false;
            else if (val.toLowerCase() == 'null')
              result[name] = null;
            else
              result[name] = val;
            onlyText = false;
          }
        }

        return onlyText ? (textValue.length > 0 ? unescapeString(textValue) : null) : result;
      case XMLNodeType.TEXT_NODE:
        var value = trim(node.nodeValue);
        return (value == '') ? null : value;
      case XMLNodeType.CDATA_SECTION_NODE:
        return node.nodeValue;
      case XMLNodeType.DOCUMENT_NODE:
        return parseXML(node.documentElement);
      default:
        return null;
    }
  };

  /**
   * Max XML size for MSXML2.  Used to prevent potential DoS attacks.
   * @type {number}
   */
  var MAX_XML_SIZE_KB = 2 * 1024;  // In kB

  /**
   * Max XML size for MSXML2.  Used to prevent potential DoS attacks.
   * @type {number}
   */
  var MAX_ELEMENT_DEPTH = 256; // Same default as MSXML6.

  /**
   * Creates an instance of the MSXML2.DOMDocument.
   * @return {Document} The new document.
   */
  var createMsXmlDocument = function() {
    var doc = new ActiveXObject('MSXML2.DOMDocument');
    if (doc) {
      // Prevent potential vulnerabilities exposed by MSXML2
      doc.resolveExternals = false;
      doc.validateOnParse = false;
      // Add a try catch block because accessing these properties will throw an
      // error on unsupported MSXML versions. This affects Windows machines
      // running IE6 or IE7 that are on XP SP2 or earlier without MSXML updates.
      // See http://msdn.microsoft.com/en-us/library/ms766391(VS.85).aspx for
      // specific details on which MSXML versions support these properties.
      try {
        doc.setProperty('ProhibitDTD', true);
        doc.setProperty('MaxXMLSize', MAX_XML_SIZE_KB);
        doc.setProperty('MaxElementDepth', MAX_ELEMENT_DEPTH);
      } catch (e) {
        // No-op.
      }
    }
    return doc;
  };

  /**
   * Creates an XML document from a string
   * @param {string} xml The text.
   * @return {Document} XML document from the text.
   */
  var loadXml = function(xml) {
    if (typeof DOMParser != 'undefined') {
      return new DOMParser().parseFromString(xml, 'application/xml');
    } else if (typeof ActiveXObject != 'undefined') {
      var doc = createMsXmlDocument();
      doc.loadXML(xml);
      return doc;
    }
    throw Error('Your browser does not support loading xml documents');
  };

  var doTransforms = function(json, map) {
    for (var i = 0; i < map.length; i++) {
      var trs = map[i];
      if (!isArray(trs))
        applyTransform(trs, json);
      else {
        trs.forEach(function(tr) {
          applyTransform(tr, json);
        })
      }
    }
  };

  /**
   * Converts xml to json via set of transformations.
   * @param xmlOrXmlString XML or XML string to parse.
   * @param {?string=} opt_type What type of default to use. The set are: 'multi' which
   * @param {(Array|Function|Object)=} opt_transformations Custom transformations.
   * used by default and for charts that transforms to multi-series chart, 'single'
   * which used for single-series chart (pie, funnel, heatmap) and null to drop default transformations.
   * transformations.
   */
  anychart.migrationTool.transformXml = function(xmlOrXmlString, opt_type, opt_transformations) {
    if (!isNull(opt_type))
      opt_type = opt_type || 'multi';
    opt_transformations = opt_transformations || [];
    var xml;
    if (isString(xmlOrXmlString)) {
      xml = loadXml(xmlOrXmlString);
    } else
      xml = xmlOrXmlString;

    var json = parseXML(xml);

    if (isNull(opt_type))
      DEFAULT_TRANSFORMATIONS = [];
    else if (opt_type == 'single')
      DEFAULT_TRANSFORMATIONS = DEFAULT_TRANSFORMATIONS.concat(anychart.migrationTool.nodes.singleSeriesCharts, anychart.migrationTool.nodes.cleaners);
    else
      DEFAULT_TRANSFORMATIONS = DEFAULT_TRANSFORMATIONS.concat(anychart.migrationTool.nodes.multiSeriesCharts, anychart.migrationTool.nodes.cleaners);

    var map = DEFAULT_TRANSFORMATIONS.concat(opt_transformations);

    doTransforms(json, map);

    return json;
  };

  /**
   * Converts json to json via set of transformations.
   * @param jsonOrJsonString JSON or JSON string.
   * @param {?string=} opt_type What type of default to use. The set are: 'multi' which
   * @param {(Array|Function|Object)=} opt_transformations Custom transformations.
   * used by default and for charts that transforms to multi-series chart, 'single'
   * which used for single-series chart (pie, funnel, heatmap) and null to drop default transformations.
   * transformations.
   */
  anychart.migrationTool.transformJson = function(jsonOrJsonString, opt_type, opt_transformations) {
    if (!isNull(opt_type))
      opt_type = opt_type || 'multi';
    opt_transformations = opt_transformations || [];
    DEFAULT_TRANSFORMATIONS.unshift(anychart.migrationTool.camelCase);
    var json;
    if (isString(jsonOrJsonString))
      json = JSON.parse(jsonOrJsonString);
    else
      json = jsonOrJsonString;

    if (isNull(opt_type))
      DEFAULT_TRANSFORMATIONS = [];
    else if (opt_type == 'single')
      DEFAULT_TRANSFORMATIONS = DEFAULT_TRANSFORMATIONS.concat(anychart.migrationTool.nodes.singleSeriesCharts, anychart.migrationTool.nodes.cleaners);
    else
      DEFAULT_TRANSFORMATIONS = DEFAULT_TRANSFORMATIONS.concat(anychart.migrationTool.nodes.multiSeriesCharts, anychart.migrationTool.nodes.cleaners);

    var map = DEFAULT_TRANSFORMATIONS.concat(opt_transformations);

    doTransforms(json, map);

    return json;
  };

  var applyTransform = function(tr, json) {
    if (isFunction(tr))
      return tr(json);
    else if (isObject(tr)) {
      if (tr['action'])
        return actionToFunction[tr['action']](tr, json);
      else
        return json;
    } else
      return json;
  };

  /**
   * Move property.
   * @param {{action:string, from:string, to:string, valueReplacer:Function}} tr Transformation object.
   * @param {Object} json Json.
   * @return {Object} modified json.
   */
  var moveProperty = function(tr, json) {
    var from = tr.from;
    var to = tr.to;
    var valueReplacer = tr.valueReplacer;

    var toValue = anychart.migrationTool.getValueByPath(json, to);

    var fromPath = from.split('.');
    var fromValue = anychart.migrationTool.getValueByPath(json, fromPath);
    if (!isDef(fromValue))
      return json;

    if (valueReplacer)
      fromValue = valueReplacer(fromValue, toValue);

    anychart.migrationTool.setValueByPath(json, to, fromValue);

    var last = fromPath.splice(fromPath.length - 1, 1);
    var part = anychart.migrationTool.getValueByPath(json, fromPath);
    delete part[last];

    return json;
  };

  /**
   * Delete property.
   * @param {{action:string, targets: Array.<string>}} tr Transformation object.
   * @param {Object} json Json.
   * @return {Object} modified json.
   */
  var deleteProperty = function(tr, json) {
    for (var i = 0; i < tr.targets.length; i++) {
      var target = tr.targets[i];
      var targetPath = target.split('.');
      if (targetPath.length == 1)
        delete json[target];
      else {
        var last = targetPath.splice(targetPath.length - 1, 1);
        var part = anychart.migrationTool.getValueByPath(json, targetPath);
        delete part[last];
      }
    }
    return json;
  };

  var actionToFunction = {
    'move': moveProperty,
    'delete': deleteProperty
  };

  // HELPER FUNCTIONS

  anychart.migrationTool.camelCase = function(json) {
    anychart.migrationTool.transformAttributes(json, toCamelCase);
    for (var i in json) {
      if (json.hasOwnProperty(i))
        anychart.migrationTool.camelCase(json[i]);
    }
    return json;
  };

  anychart.migrationTool.attrs = {};

  anychart.migrationTool.attrs.font = {
    'family': 'fontFamily',
    'size': 'fontSize',
    'color': 'fontColor',
    'renderAsHtml': 'useHtml'
  };

  var PLOT_TYPES = {
    'categorizedvertical': 'cartesian',
    'categorizedhorizontal': 'cartesian',
    'categorizedbyseriesvertical': 'cartesian',
    'categorizedbyserieshorizontal': 'cartesian',
    'scatter': 'scatter',
    'pie': 'pie',
    'polar': 'polar',
    'radar': 'radar',
    'doughnut': 'pie',
    'map': 'map',
    'heatmap': 'heatmap',
    'treemap': 'treemap',
    'funnel': 'funnel'
  };

  var isVertical = true;
  var is3d = false;
  var defaultSeriesType;
  anychart.migrationTool.nodes = {};
  anychart.migrationTool.nodes.defaults = [
    {
      action: 'move',
      from: 'charts.chart',
      to: 'chart',
      valueReplacer: function(fromValue) {
        if (isArray(fromValue))
          fromValue = fromValue[0];
        if (fromValue.type && !fromValue.plotType)
          fromValue.plotType = fromValue.type;
        return fromValue;
      }
    },
    {
      action: 'move',
      from: 'settings.animation',
      to: 'chart.animation'
    },
    function(json) {
      var value = anychart.migrationTool.getValueByPath(json, 'chart.dataPlotSettings.enable3dMode');
      is3d = value || is3d;
      return json;
    },
    {
      action: 'move',
      from: 'chart.plotType',
      to: 'chart.type',
      valueReplacer: function(fromValue) {
        fromValue = fromValue.toLowerCase();
        var plotType = PLOT_TYPES[fromValue];
        if (fromValue.indexOf('horizontal') != -1)
          isVertical = false;
        if (!plotType)
          return 'cartesian';
        if (plotType == 'pie' && is3d)
          plotType = 'pie3d';
        return plotType;
      }
    },
    {
      action: 'move',
      from: 'chart.dataPlotSettings.defaultSeriesType',
      to: 'chart.defaultSeriesType',
      valueReplacer: function(fromValue) {
        defaultSeriesType = fromValue.toLowerCase();
        if ((defaultSeriesType.indexOf('bar') > -1) && isVertical)
          fromValue = fromValue.replace(/bar/i, 'column');
        return fromValue;
      }
    },
    function(json) {
      json.chart.barChartMode = !isVertical;
      return json;
    }
  ];

  var dataAttributesTransformationMap = {
    'start': 'low',
    'end': 'high',
    'y': 'value'
  };
  var modifyPointData = function(pointData, seriesType) {
    pointData.map(function(dataItem) {
      anychart.migrationTool.transformAttributes(dataItem, dataAttributesTransformationMap);
    })
  };

  anychart.migrationTool.nodes.data = [
    {
      action: 'move',
      from: 'chart.data.series',
      to: 'chart.series',
      valueReplacer: function(fromValue) {
        if (!isArray(fromValue))
          fromValue = [fromValue];
        fromValue = fromValue.map(function(series) {
          anychart.migrationTool.transformAttributes(series, {
            'type': 'seriesType'
          });
          if (series.point) {
            series.data = series.point;
            delete series.point
          }
          modifyPointData(series.data, series.seriesType || defaultSeriesType);
          return series;
        });
        return fromValue;
      }
    }
  ];

  // seriesType to seriesSettings map
  // <line_settings> should merge to <series type='spline'>
  var typeToSettingsMap = {
    'splinearea': 'area',
    'rangesplinearea': 'rangearea',
    'spline': 'line'
  };
  var seriesSettingsTypeSuits = function(seriesSettingsType, seriesType) {
    return typeToSettingsMap[seriesType] == seriesSettingsType || seriesType == seriesSettingsType;
  };

  // closure over valueReplacer to support different kind of series settings
  // area_setting == seriesSettingsValueReplacer('area')
  var seriesSettingsValueReplacer = function(seriesSettingsType) {
    seriesSettingsType = seriesSettingsType.toLowerCase();
    return function(fromValue, toValue) {
      var seriesList = isArray(toValue) ? toValue :
        isObject(toValue) ? [toValue] : null;
      if (isNull(seriesList))
        return fromValue;
      seriesList = seriesList.map(function(item) {
        if ((item.seriesType && seriesSettingsTypeSuits(seriesSettingsType, item.seriesType.toLowerCase())) ||
          ((seriesSettingsTypeSuits(seriesSettingsType, defaultSeriesType)) && !item.seriesType))
          anychart.migrationTool.mixin(item, fromValue);
        return item;
      });
      return seriesList;
    }
  };
  var seriesLabelsSettingsValueReplacer = function(fromValue) {
    if (fromValue.format) {
      //TODO(AntonKagakin): replace with textFormatter, when tokens will be implemented.
      delete fromValue['format'];
    }
    if (fromValue.font) {
      delete fromValue.font.effects;
      anychart.migrationTool.transformAttributes(fromValue.font, anychart.migrationTool.attrs.font);
      if ('bold' in fromValue.font) {
        fromValue['fontWeight'] = fromValue.font.bold ? 'bold' : 'normal';
        delete fromValue.font.bold;
      }
      anychart.migrationTool.mixin(fromValue, fromValue.font);
      delete fromValue.font;
    }
    if (fromValue.position) {
      anychart.migrationTool.transformAttributes(fromValue.position, {
        'halign': 'hAlign',
        'valign': 'vAlign'
      });

      anychart.migrationTool.mixin(fromValue, fromValue.position);
      if ('anchor' in fromValue.position) {
        fromValue['position'] = fromValue.position['anchor'];
      }

      if (!isString(fromValue.position))
        delete fromValue.position;
    }
    return fromValue;
  };
  var seriesTooltipSettingsValueReplacer = function(fromValue) {
    if (fromValue.format) {
      fromValue.textFormatter = fromValue.format;
      delete fromValue['format'];
    }

    if (fromValue.background && fromValue.background.border && fromValue.background.border.color) {
      fromValue.background.stroke = fromValue.background.border.color;
      delete fromValue.background.border;
    }

    if (fromValue.font) {
      anychart.migrationTool.transformAttributes(fromValue.font, anychart.migrationTool.attrs.font);
      anychart.migrationTool.mixin(fromValue, fromValue.font);
      delete fromValue.font;
    }

    return fromValue;
  };

  var defaultLabelSettingsActionFor = function(seriesName) {
    return {
      action: 'move',
      from: 'chart.dataPlotSettings.' + seriesName + 'Series.labelSettings',
      to: 'chart.dataPlotSettings.' + seriesName + 'Series.labels',
      valueReplacer: seriesLabelsSettingsValueReplacer
    }
  };

  var defaultTooltipSettingsActionFor = function(seriesName) {
    return {
      action: 'move',
      from: 'chart.dataPlotSettings.' + seriesName + 'Series.tooltipSettings',
      to: 'chart.dataPlotSettings.' + seriesName + 'Series.tooltip',
      valueReplacer: seriesTooltipSettingsValueReplacer
    }
  };
  var defaultMarkerSettingsActionFor = function(seriesName) {
    return [
      {
        action: 'move',
        from: 'chart.dataPlotSettings.' + seriesName + 'Series.markerSettings.marker.size',
        to: 'chart.dataPlotSettings.' + seriesName + 'Series.markerSettings.size'
      },
      {
        action: 'move',
        from: 'chart.dataPlotSettings.' + seriesName + 'Series.markerSettings.marker.type',
        to: 'chart.dataPlotSettings.' + seriesName + 'Series.markerSettings.type'
      },
      {
        action: 'move',
        from: 'chart.dataPlotSettings.' + seriesName + 'Series.markerSettings',
        to: 'chart.dataPlotSettings.' + seriesName + 'Series.markers'
      }
    ]
  };

  var defaultSettingsToSeriesFor = function(seriesName) {
    return {
      action: 'move',
      from: 'chart.dataPlotSettings.' + seriesName + 'Series',
      to: 'chart.series',
      valueReplacer: seriesSettingsValueReplacer(seriesName)
    }
  };


  var defaultSettingsActionsFor = function(seriesName) {
    return [
      // labels
      defaultLabelSettingsActionFor(seriesName),
      //tooltip
      defaultTooltipSettingsActionFor(seriesName),
      // markers
      defaultMarkerSettingsActionFor(seriesName),
      // settings to series
      defaultSettingsToSeriesFor(seriesName)
    ]
  };

  anychart.migrationTool.nodes.dataPlotSettingsBarSeries = [
    {
      action: 'move',
      from: 'chart.dataPlotSettings.barSeries.pointPadding',
      to: 'chart.barsPadding'
    },
    {
      action: 'move',
      from: 'chart.dataPlotSettings.barSeries.groupPadding',
      to: 'chart.barGroupsPadding'
    }
  ].concat(defaultSettingsActionsFor('bar'));

  anychart.migrationTool.nodes.dataPlotSettingsRangeBarSeries = [
    {
      action: 'move',
      from: 'chart.dataPlotSettings.rangeBarSeries.barStyle.fill',
      to: 'chart.dataPlotSettings.rangeBarSeries.fill'
    }
  ].concat(defaultSettingsActionsFor('rangebar'));

  anychart.migrationTool.nodes.dataPlotSettingsLineSeries = [
    {
      action: 'move',
      from: 'chart.dataPlotSettings.lineSeries.pointPadding',
      to: 'chart.barsPadding'
    },
    {
      action: 'move',
      from: 'chart.dataPlotSettings.lineSeries.groupPadding',
      to: 'chart.barGroupsPadding'
    }
  ].concat(defaultSettingsActionsFor('line'));

  anychart.migrationTool.nodes.dataPlotSettingsAreaSeries = [
    {
      action: 'move',
      from: 'chart.dataPlotSettings.areaSeries.areaStyle.fill',
      to: 'chart.dataPlotSettings.areaSeries.fill'
    }
  ].concat(defaultSettingsActionsFor('area'));

  anychart.migrationTool.nodes.dataPlotSettingsRangeAreaSeries = [
    {
      action: 'move',
      from: 'chart.dataPlotSettings.rangeAreaSeries.rangeAreaStyle.fill',
      to: 'chart.dataPlotSettings.rangeAreaSeries.fill'
    }
  ].concat(defaultSettingsActionsFor('rangeArea'));

  anychart.migrationTool.nodes.dataPlotSettingsMarkerSeries = [
    defaultTooltipSettingsActionFor('marker'),
    {
      action: 'move',
      from: 'chart.dataPlotSettings.markerSeries.markerStyle.marker.size',
      to: 'chart.dataPlotSettings.markerSeries.size'
    },
    {
      action: 'move',
      from: 'chart.dataPlotSettings.markerSeries.markerStyle.fill',
      to: 'chart.dataPlotSettings.markerSeries.fill'
    },
    {
      action: 'move',
      from: 'chart.dataPlotSettings.markerSeries.markerStyle.markerType',
      to: 'chart.dataPlotSettings.markerSeries.type'
    },
    defaultSettingsToSeriesFor('marker')
  ];

  anychart.migrationTool.nodes.dataPlotSettingsBubbleSeries = [
    {
      action: 'move',
      from: 'chart.dataPlotSettings.bubbleSeries.bubbleStyle.fill',
      to: 'chart.dataPlotSettings.bubbleSeries.fill'
    },
    {
      action: 'move',
      from: 'chart.dataPlotSettings.bubbleSeries.bubbleStyle.border',
      to: 'chart.dataPlotSettings.bubbleSeries.stroke'
    },
    {
      action: 'move',
      from: 'chart.dataPlotSettings.bubbleSeries.minimumBubbleSize',
      to: 'chart.minBubbleSize'
    },
    {
      action: 'move',
      from: 'chart.dataPlotSettings.bubbleSeries.maximumBubbleSize',
      to: 'chart.maxBubbleSize'
    }
  ].concat(defaultSettingsActionsFor('bubble'));

  anychart.migrationTool.nodes.dataPlotSettingsPolar = [
    {
      action: 'move',
      from: 'chart.dataPlotSettings.polar.startAngle',
      to: 'chart.startAngle'
    },
    {
      action: 'move',
      from: 'chart.dataPlotSettings.polar.background.border',
      to: 'chart.dataPlotSettings.polar.background.stroke'
    },
    {
      action: 'move',
      from: 'chart.dataPlotSettings.polar.background',
      to: 'chart.background'
    }
  ];
  anychart.migrationTool.nodes.dataPlotSettingsRadar = [];

  anychart.migrationTool.nodes.dataPlotSettingsPie = [
    {
      action: 'move',
      from: 'chart.dataPlotSettings.pieSeries.tooltipSettings',
      to: 'chart.tooltip',
      valueReplacer: seriesTooltipSettingsValueReplacer
    },
    {
      action: 'move',
      from: 'chart.dataPlotSettings.pieSeries.labelSettings',
      to: 'chart.labels',
      valueReplacer: seriesLabelsSettingsValueReplacer
    },
    {
      action: 'move',
      from: 'chart.labels.mode',
      to: 'chart.labels.position'
    },
    {
      action: 'move',
      from: 'chart.dataPlotSettings.pieSeries.connector',
      to: 'chart.connectorStroke'
    },
    {
      action: 'move',
      from: 'chart.series',
      to: 'chart.data',
      valueReplacer: function(fromValue) {
        if (isArray(fromValue))
          fromValue = fromValue[0];
        if (fromValue.data)
          return fromValue.data;
        else
          return null;
      }
    }
  ];
  anychart.migrationTool.nodes.dataPlotSettingsFunnel = [
    {
      action: 'move',
      from: 'chart.dataPlotSettings.funnelSeries.inverted',
      to: 'chart.reversed'
    },
    {
      action: 'move',
      from: 'chart.dataPlotSettings.funnelSeries.neckHeight',
      to: 'chart.neckHeight'
    },
    {
      action: 'move',
      from: 'chart.dataPlotSettings.funnelSeries.neckWidth',
      to: 'chart.neckWidth'
    },
    {
      action: 'move',
      from: 'chart.dataPlotSettings.funnelSeries.funnelStyle.fill',
      to: 'chart.fill'
    },
    {
      action: 'move',
      from: 'chart.dataPlotSettings.funnelSeries.funnelStyle.border',
      to: 'chart.stroke'
    },
    {
      action: 'move',
      from: 'chart.dataPlotSettings.funnelSeries.markerSettings.marker.size',
      to: 'chart.dataPlotSettings.funnelSeries.markerSettings.size'
    },
    {
      action: 'move',
      from: 'chart.dataPlotSettings.funnelSeries.markerSettings.marker.type',
      to: 'chart.dataPlotSettings.funnelSeries.markerSettings.type'
    },
    {
      action: 'move',
      from: 'chart.dataPlotSettings.funnelSeries.markerSettings.marker.anchor',
      to: 'chart.dataPlotSettings.funnelSeries.markerSettings.position'
    },
    {
      action: 'move',
      from: 'chart.dataPlotSettings.funnelSeries.markerSettings.border',
      to: 'chart.dataPlotSettings.funnelSeries.markerSettings.stroke'
    },
    {
      action: 'move',
      from: 'chart.dataPlotSettings.funnelSeries.markerSettings',
      to: 'chart.markers'
    },
    {
      action: 'move',
      from: 'chart.dataPlotSettings.funnelSeries.tooltipSettings',
      to: 'chart.tooltip',
      valueReplacer: seriesTooltipSettingsValueReplacer
    },
    {
      action: 'move',
      from: 'chart.dataPlotSettings.funnelSeries.labelSettings',
      to: 'chart.labels',
      valueReplacer: seriesLabelsSettingsValueReplacer
    },
    {
      action: 'move',
      from: 'chart.labels.placementMode',
      to: 'chart.labels.position'
    },
    {
      action: 'move',
      from: 'chart.dataPlotSettings.funnelSeries.connector',
      to: 'chart.connectorStroke'
    },
    {
      action: 'move',
      from: 'chart.series',
      to: 'chart.data',
      valueReplacer: function(fromValue) {
        if (isArray(fromValue))
          fromValue = fromValue[0];
        if (fromValue.data)
          return fromValue.data;
        else
          return null;
      }
    }
  ];
  anychart.migrationTool.nodes.dataPlotSettingsHeatMap = [
    {
      action: 'move',
      from: 'chart.dataPlotSettings.heatMap.tooltipSettings',
      to: 'chart.tooltip',
      valueReplacer: seriesTooltipSettingsValueReplacer
    },
    {
      action: 'move',
      from: 'chart.dataPlotSettings.heatMap.labelSettings',
      to: 'chart.labels',
      valueReplacer: seriesLabelsSettingsValueReplacer
    },
    {
      action: 'move',
      from: 'chart.dataPlotSettings.heatMap.markerSettings.marker.type',
      to: 'chart.dataPlotSettings.heatMap.markerSettings.type'
    },
    {
      action: 'move',
      from: 'chart.dataPlotSettings.heatMap.markerSettings',
      to: 'chart.markers'
    },
    {
      action: 'move',
      from: 'chart.dataPlotSettings.heatMap.heatMapStyle.fill',
      to: 'chart.fill'
    },
    {
      action: 'move',
      from: 'chart.dataPlotSettings.heatMap.heatMapStyle.border',
      to: 'chart.stroke'
    },
    {
      action: 'move',
      from: 'chart.series',
      to: 'chart.data',
      valueReplacer: function(fromValue) {
        if (isArray(fromValue))
          fromValue = fromValue[0];
        if (fromValue.data)
          return fromValue.data;
        else
          return null;
      }
    }
  ];

  anychart.migrationTool.nodes.multiSeriesCharts = []
    .concat(anychart.migrationTool.nodes.dataPlotSettingsAreaSeries)
    .concat(anychart.migrationTool.nodes.dataPlotSettingsBarSeries)
    .concat(anychart.migrationTool.nodes.dataPlotSettingsLineSeries)
    .concat(anychart.migrationTool.nodes.dataPlotSettingsMarkerSeries)
    .concat(anychart.migrationTool.nodes.dataPlotSettingsRangeBarSeries)
    .concat(anychart.migrationTool.nodes.dataPlotSettingsRangeAreaSeries)
    .concat(anychart.migrationTool.nodes.dataPlotSettingsBubbleSeries)
    .concat(anychart.migrationTool.nodes.dataPlotSettingsPolar)
    .concat(anychart.migrationTool.nodes.dataPlotSettingsRadar);

  anychart.migrationTool.nodes.singleSeriesCharts = []
    .concat(anychart.migrationTool.nodes.dataPlotSettingsPie)
    .concat(anychart.migrationTool.nodes.dataPlotSettingsFunnel)
    .concat(anychart.migrationTool.nodes.dataPlotSettingsHeatMap);

  var scaleValueReplacer = function(fromValue) {
    anychart.migrationTool.transformAttributes(fromValue, {
      'majorInterval': 'interval',
      'mode': 'stackMode',
      'minimumOffset': 'minimumGap',
      'maximumOffset': 'maximumGap'
    });
    if (fromValue.stackMode) {
      var mode = fromValue.stackMode.toLowerCase();
      if (mode == 'stacked')
        fromValue.stackMode = 'value';
      else if (mode == 'percentstacked')
        fromValue.stackMode = 'percent';
      else
        fromValue.stackMode = 'none';
    }
    return fromValue;
  };

  var rangeAxesMarkersReplacer = function(layout) {
    return function(fromValue, toValue) {
      if (!isArray(fromValue)) fromValue = [fromValue];
      fromValue = fromValue.map(function(range) {
        anychart.migrationTool.transformAttributes(range, {
          'minimum': 'from',
          'maximum': 'to'
        });
        if (!isDef(range.layout)) {
          var newLayout;
          if (isVertical ^ (layout == 'horizontal'))
            newLayout = 'vertical';
          else
            newLayout = 'horizontal';

          range.layout = newLayout;
        }
        return range;
      });
      if (toValue)
        fromValue = fromValue.concat(toValue);
      return fromValue;
    }
  };

  var gridsReplacer = function(layout) {
    return function(fromValue, toValue) {
      if (!isDef(fromValue.layout)) {
        var newLayout;
        if (isVertical ^ (layout == 'horizontal'))
          newLayout = 'vertical';
        else
          newLayout = 'horizontal';

        fromValue.layout = newLayout;
      }
      fromValue = [fromValue];
      if (toValue)
        fromValue = fromValue.concat(toValue);
      return fromValue;
    }
  };

  anychart.migrationTool.nodes.chartSettings = [
    {
      action: 'move',
      from: 'chart.chartSettings.title',
      to: 'chart.title'
    },
    {
      action: 'move',
      from: 'chart.chartSettings.legend',
      to: 'chart.legend',
      valueReplacer: function(fromValue) {
        delete fromValue.items;
        return fromValue;
      }
    },
    {
      action: 'move',
      from: 'chart.chartSettings.axes.xAxis.scale',
      to: 'chart.xScale',
      valueReplacer: scaleValueReplacer
    },
    {
      action: 'move',
      from: 'chart.chartSettings.axes.xAxis.axisMarkers.ranges.range',
      to: 'chart.rangeAxesMarkers',
      valueReplacer: rangeAxesMarkersReplacer('vertical')
    },
    {
      action: 'move',
      from: 'chart.chartSettings.axes.xAxis.majorGrid',
      to: 'chart.grids',
      valueReplacer: gridsReplacer('vertical')
    },
    {
      action: 'move',
      from: 'chart.chartSettings.axes.xAxis',
      to: 'chart.xAxes',
      valueReplacer: function(fromValue) {
        if (isVertical)
          fromValue.orientation = 'bottom';
        else
          fromValue.orientation = 'left';
        return [fromValue];
      }
    },
    {
      action: 'move',
      from: 'chart.chartSettings.axes.yAxis.labels.showLastLabel',
      to: 'chart.chartSettings.axes.yAxis.drawLastLabel'
    },
    {
      action: 'move',
      from: 'chart.chartSettings.axes.yAxis.labels.align',
      to: 'chart.chartSettings.axes.yAxis.position'
    },
    {
      action: 'move',
      from: 'chart.chartSettings.axes.yAxis.scale',
      to: 'chart.yScale',
      valueReplacer: scaleValueReplacer
    },
    {
      action: 'move',
      from: 'chart.chartSettings.axes.yAxis.axisMarkers.ranges.range',
      to: 'chart.rangeAxesMarkers',
      valueReplacer: rangeAxesMarkersReplacer('horizontal')
    },
    {
      action: 'move',
      from: 'chart.chartSettings.axes.yAxis.majorGrid.interlacedFills.even.fill',
      to: 'chart.chartSettings.axes.yAxis.majorGrid.evenFill'
    },
    {
      action: 'move',
      from: 'chart.chartSettings.axes.yAxis.majorGrid',
      to: 'chart.grids',
      valueReplacer: gridsReplacer('horizontal')
    },
    {
      action: 'move',
      from: 'chart.chartSettings.axes.yAxis.minorTickmark',
      to: 'chart.chartSettings.axes.yAxis.minorTicks'
    },
    {
      action: 'move',
      from: 'chart.chartSettings.axes.yAxis',
      to: 'chart.yAxes',
      valueReplacer: function(fromValue) {
        if (isVertical)
          fromValue.orientation = 'left';
        else
          fromValue.orientation = 'bottom';
        return [fromValue];
      }
    }
  ];

  var DEFAULT_TRANSFORMATIONS = [
    anychart.migrationTool.nodes.defaults,
    anychart.migrationTool.nodes.data,
    anychart.migrationTool.nodes.chartSettings
  ];

  anychart.migrationTool.nodes.clean = [
    {
      action: 'delete',
      targets: [
        'charts',
        'settings',
        'chart.chartSettings'
      ]
    }
  ];

  var colorRe = /(Blend|Dark|Light|%Color)/;
  var hasColorToken = function(obj) {
    return (obj.color && colorRe.test(obj.color));
  };

  anychart.migrationTool.nodes.fillCleaner = function(json) {
    for (var i in json) {
      if (json.hasOwnProperty(i)) {
        if (i == 'fill' || i == 'border') {
          if (Object.keys(json[i]).length == 1 && json[i].opacity)
            json[i] = function() {
              return anychart.color.setOpacity(this.sourceColor, parseInt(json[i].opacity, 10), true);
            };

          if (Object.keys(json[i]).length == 1 && json[i].thickness)
            json[i] = function() {
              return anychart.color.setThickess(this.sourceColor, json[i].thickness);
            };

          if (json[i].type && json[i].type.toLowerCase() == 'gradient') {
            var keys = json[i].gradient.key;
            if (keys.some(hasColorToken))
              delete json[i];
          } else if (hasColorToken(json[i]))
            delete json[i];
          continue;
        }
        if (isObject(json[i]))
          anychart.migrationTool.nodes.fillCleaner(json[i]);
      }
    }
    return json;
  };

  anychart.migrationTool.nodes.cleaners = [
    anychart.migrationTool.nodes.clean,
    anychart.migrationTool.nodes.fillCleaner
  ];


})(window);
