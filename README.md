* AnyChart 6 to 7 Migration *

This small FAQ is intended to assist those who want to start migration from AnyChart version 5 or 6 to our new JavaScript AnyChart 7 Framework. 

* Overview *

The main difference between the old engine and the new one is the fact that you no longer need SWF file, you need only one JavaScript file.

There is no direct compatibilty between AnyChart 6 and Anychart 7, not even with with HTML5 version of AnyChart 6. New <i>anychart.min.js</i> is not the same thing as <i>AnyChartHTML5.js</i> or <i>AnyChart.js</i>, you can't just replace one with another.

New component is more "code-oriented", we created it thinking of JavaScript as a main language for most of modern websites frontends, thus, in some cases, more coding and knowledge of JavaScript is required, though you can still do most of configurations in XML or JSON, if you want to stick with them - in this case almost everything is the same, except that config format are different.

In some ways everything stayed that same, you configure chart, load data and then write to some container on the page, but at the same time a lot of things are different now:

- Component architechture has slightly changed, there is no such thing as plot_type (Categorized, Pie, CategorizedBySeries, CategorizedBySeriesHorizontal,.. Scatter), you create chart using two basic constructors: [anychart.cartesian] and [anychart.scatter] (and there are several helper constructors that add defaults that suit certain series types better, like [anychart.bar], [anychart.line], [anychart.pie] and so on).

- Data structures for points and series has changed, instead of data>series>point structure, we now have datasets which are mapped (default mapping is available for most types), mapped datasets are used to put data into series.

- Dynamic data, ways to add/show/hide/remove are orgainic now.

- Overall ideology has changed.

- There are more ways of setting data now: JavaScript, XML, JSON.

- Updates made easier, mostly you don't need to invoke special methods, you just change config and it is instantly applied. 
- Events are handled differently, and there a more events now.

- There are no styles and templates now, they are replaced by Themes and ability to copy initial config as JSON objects.

- Ways to set dashboard layouts has changed, there are no views now, we have stage, layers and tables now.

- Now you can draw virtually anything using graphics class.

- Not all chart types are supported at the moment.

- Not all features are supported at the moment.

* XML and JSON Configuration *

If you want to stick with XML or JSON configs, but wish to update the scripts that generate them, please proceed to these articles: http://docs.anychart.com/latest/Working_with_Data/Data_From_XML and http://docs.anychart.com/latest/Working_with_Data/Data_From_JSON, XML and JSON schemas are available too.

* Migration Assistant Tool *

This migration tool is an extendable script that may help some of AnyChart 6 users to move from AnyChart 6 to AnyChart 7 easier. Please see *samples* subfolder to see how things work.

We understand your desire to change only this and the plug in old XML, unfortunately it is not that easy, as we've said above - the ideology and architechture of the component changed, and building a script that will convert any possible AnyChart 6 XML Config to the AnyChart 7 config is hard, if possible at all.

A customizable script, however, may help you to jumpstart things, we've created a script that does the basics and provide you with functions to extend it.

* Migration Assistant Tool Tutorial *

Coming soon.

