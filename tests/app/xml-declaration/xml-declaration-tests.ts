import * as TKUnit from "../tk-unit";
import * as view from "@nativescript/core/ui/core/view";
import { Builder } from "@nativescript/core/ui/builder";
import * as buttonModule from "@nativescript/core/ui/button";
import * as switchModule from "@nativescript/core/ui/switch";
import * as searchBarModule from "@nativescript/core/ui/search-bar";
import * as textFieldModule from "@nativescript/core/ui/text-field";
import * as gridLayoutModule from "@nativescript/core/ui/layouts/grid-layout";
import * as absoluteLayoutModule from "@nativescript/core/ui/layouts/absolute-layout";
import * as types from "@nativescript/core/utils/types";
import * as observable from "@nativescript/core/data/observable";
import * as stackLayoutModule from "@nativescript/core/ui/layouts/stack-layout";
import { Label } from "@nativescript/core/ui/label";
import { Page } from "@nativescript/core/ui/page";
import { Button } from "@nativescript/core/ui/button";
import { TabView } from "@nativescript/core/ui/tab-view";
import { Observable } from "@nativescript/core/data/observable";
import { TemplateView } from "./template-builder-tests/template-view";
import * as listViewModule from "@nativescript/core/ui/list-view";
import * as helper from "../ui-helper";
import * as viewModule from "@nativescript/core/ui/core/view";
import * as platform from "@nativescript/core/platform";
import * as gesturesModule from "@nativescript/core/ui/gestures";
import * as segmentedBar from "@nativescript/core/ui/segmented-bar";
import { Source } from "@nativescript/core/utils/debug";
import { PercentLength, Length } from "@nativescript/core/ui/core/view";

export function test_load_IsDefined() {
    TKUnit.assertTrue(types.isFunction(Builder.load), "Builder should have load method!");
}

export function test_parse_IsDefined() {
    TKUnit.assertTrue(types.isFunction(Builder.parse), "Builder should have parse method!");
}

export function test_load_ShouldThrowWithInvalidFileName() {
    TKUnit.assertThrows(() => Builder.load("./xml-declaration/invalid-page.xml"),
        "Loading component from a missing module SHOULD throw an error.");
}

export function test_load_ShouldNotCrashWithoutExports() {
    var v = Builder.load("./xml-declaration/mainPage.xml");
    TKUnit.assertTrue(v instanceof view.View, "Expected result: View; Actual result: " + v + ";");
}

export function test_loadWithOptionsNoXML() {
    var v = Builder.load({
        path: "~/xml-declaration/mymodule",
        name: "MyControl",
        exports: exports,
        page: new Page()
    });

    TKUnit.assertTrue(v instanceof view.View, "Expected result: View; Actual result: " + v + ";");
}

export function test_loadWithOptionsNoXML_CSSIsApplied() {
    let newPage = helper.getCurrentPage();
    newPage.content = Builder.load({
        path: "~/xml-declaration/mymodule",
        name: "MyControl",
        exports: exports,
        page: newPage
    });

    TKUnit.assert(newPage.isLoaded, "The page should be loaded here.");
    helper.assertViewBackgroundColor(newPage.content, "#FF0000");
}

export function test_loadInheritedPageAndResolveFromChild() {
    var basePath = "xml-declaration/";
    helper.navigateToModuleAndRunTest(basePath + "inherited-page", null, (page) => {
        let contentLabel = <Label>page.content;
        TKUnit.assertEqual("Inherited and loaded", contentLabel.text);

        let discoveredPage = contentLabel.page;
        TKUnit.assertEqual(page, discoveredPage);

        let discoveredAncestorByBaseType = viewModule.getAncestor(contentLabel, Page);
        TKUnit.assertEqual(page, discoveredAncestorByBaseType);

        let discoveredAncestorByInheritedTypeName = viewModule.getAncestor(contentLabel, "InheritedPage");
        TKUnit.assertEqual(page, discoveredAncestorByInheritedTypeName);
    });
}

export function test_loadWithOptionsWithXML() {
    var v = Builder.load({
        path: "~/xml-declaration/mymodulewithxml",
        name: "MyControl",
        exports: exports,
        page: new Page()
    });
    TKUnit.assertTrue(v instanceof view.View, "Expected result: View; Actual result: " + v + ";");
}

export function test_loadWithOptionsWithXML_CSSIsApplied() {
    var newPage: Page;
    var pageFactory = function (): Page {
        newPage = new Page();

        newPage.content = Builder.load({
            path: "~/xml-declaration/mymodulewithxml",
            name: "MyControl",
            exports: exports,
            page: newPage
        });

        return newPage;
    };

    helper.navigate(pageFactory);
    TKUnit.assert(newPage.isLoaded, "The page should be loaded here.");
    helper.assertViewBackgroundColor(newPage.content, "#008000");
}

export function test_loadWithOptionsFromTNS() {
    var v = Builder.load({
        path: "ui/label",
        name: "Label"
    });

    TKUnit.assert(v instanceof Label, "Expected result: Label; Actual result: " + v + ";");
}

export function test_loadWithOptionsFromTNSPath() {
    var v = Builder.load({
        path: "ui/label",
        name: "Label"
    });

    TKUnit.assert(v instanceof Label, "Expected result: Label; Actual result: " + v + ";");
}

export function test_loadWithAttributes() {
    var lText = "Nativescript rocks";
    var lWrap = true;
    var lColor = "#FF0000"; // red

    var v = Builder.load({
        path: "ui/label",
        name: "Label",
        attributes: {
            text: lText,
            textWrap: lWrap,
            style: "color: " + lColor + ";"
        }
    });

    TKUnit.assertEqual(v["text"], lText, "Expected result: true; Actual result: " + v + ";");
    TKUnit.assertEqual(v["textWrap"], true, "Expected result: true; Actual result: " + v + ";");
    helper.assertViewColor(v, lColor);
}

export function test_parse_ShouldNotCrashWithoutExports() {
    const xml = global.loadModule("xml-declaration/mainPage.xml", true);

    var v: view.View = Builder.parse(xml);
    TKUnit.assert(v instanceof view.View, "Expected result: View; Actual result: " + v + ";");
}

export function test_parse_ShouldResolveExportsFromCodeFile() {
    var page = Builder.parse("<Page codeFile='~/xml-declaration/custom-code-file-page' loaded='loaded'></Page>");
    page._emit("loaded");

    TKUnit.assert((<any>page).customCodeLoaded, "Parse should resolve exports from custom code file.");
}

export function test_parse_ShouldResolveExportsFromImport() {
    var page = Builder.parse("<Page import='~/xml-declaration/custom-code-file-page' loaded='loaded'></Page>");
    page._emit("loaded");

    TKUnit.assert((<any>page).customCodeLoaded, "Parse should resolve exports from import.");
}

export function test_parse_ShouldResolveExportsFromCodeFileForPageContent() {
    var page = Builder.parse("<Page codeFile='~/xml-declaration/custom-code-file-page' loaded='loaded'><Button loaded='loaded' /></Page>");
    (<any>page).content._emit("loaded");

    TKUnit.assert((<any>page).content.customCodeLoaded, "Parse should resolve exports from custom code file for page content.");
}

export function test_parse_ShouldThrowErrorWhenInvalidCodeFileIsSpecified() {
    var e: Error;
    try {
        Builder.parse("<Page codeFile='~/xml-declaration/some-code-file' loaded='pageLoaded'></Page>");
    } catch (ex) {
        e = ex;
    }

    TKUnit.assert(e, "Expected result: Error; Actual result: " + e);
}

export function test_parse_ShouldResolveExportsFromCodeFileForTemplates() {
    var p = <Page>Builder.parse(`
    <Page codeFile="~/xml-declaration/custom-code-file-page" xmlns:customControls="xml-declaration/mymodulewithxml">
        <ListView items="{{ items }}" itemLoading="{{ itemLoading }}">
            <ListView.itemTemplate>
                <customControls:MyControl loaded="loaded" />
            </ListView.itemTemplate>
        </ListView>
    </Page>`);
    function testAction(views: Array<viewModule.View>) {
        var ctrl;

        var obj = new observable.Observable();
        obj.set("items", [1]);
        obj.set("itemLoading", function (args: listViewModule.ItemEventData) {
            ctrl = args.view;
        });
        p.bindingContext = obj;

        TKUnit.waitUntilReady(() => !!ctrl);
        TKUnit.assert((<any>ctrl).customCodeLoaded, "Parse should resolve exports for templates from custom code file.");
    }

    helper.navigate(function () { return p; });
    testAction([p.content, p]);
}

export function test_parse_css_is_applied_by_type_to_lower_case_dashed_components() {
    var newPage: Page;
    var pageFactory = function (): Page {
        newPage = <Page>Builder.parse("<page cssFile='~/xml-declaration/custom-css-file-page.css'><stack-layout /></page>");

        return newPage;
    };

    helper.navigate(pageFactory);
    TKUnit.assert(newPage.isLoaded, "The page should be loaded here.");
    helper.assertViewBackgroundColor(newPage.content, "#008000");
}

export function test_parse_ShouldApplyCssFromCssFile() {
    var newPage: Page;
    var pageFactory = function (): Page {
        newPage = <Page>Builder.parse("<Page cssFile='~/xml-declaration/custom-css-file-page.css'><Label class='MyClass' /></Page>");

        return newPage;
    };

    helper.navigate(pageFactory);
    TKUnit.assert(newPage.isLoaded, "The page should be loaded here.");
    helper.assertViewBackgroundColor(newPage.content, "#008000");
}

export function test_parse_ShouldResolveExportsFromCodeFileAndApplyCssFile() {
    var newPage: Page;
    var pageFactory = function (): Page {
        newPage = <Page>Builder.parse("<Page codeFile='~/xml-declaration/custom-code-file-page' cssFile='~/xml-declaration/custom-css-file-page.css' loaded='loaded'><Label class='MyClass' /></Page>");

        return newPage;
    };

    helper.navigate(pageFactory);
    TKUnit.assert(newPage.isLoaded, "The page should be loaded here.");
    TKUnit.assert((<any>newPage).customCodeLoaded, "Parse should resolve exports from custom code file.");
    helper.assertViewBackgroundColor(newPage.content, "#008000");
}

export function test_parse_ShouldFindEventHandlersInExports() {
    var loaded;
    var page = Builder.parse("<Page loaded='myLoaded'></Page>", {
        myLoaded: args => {
            loaded = true;
        }
    });
    page._emit("loaded");

    TKUnit.assertTrue(loaded, "Parse should find event handlers in exports.");
}

export function test_parse_ShouldFindEventHandlersWithOnInExports() {
    var loaded;
    var page = Builder.parse("<Page onloaded='myLoaded'></Page>", {
        myLoaded: args => {
            loaded = true;
        }
    });
    page._emit("loaded");

    TKUnit.assertTrue(loaded, "Parse should find event handlers in exports.");
}

export function test_parse_ShouldSetGridAttachedProperties() {
    var p = <Page>Builder.parse("<Page><GridLayout><Label row='1' col='2' rowSpan='3' colSpan='4' /></GridLayout></Page>");
    var grid = <gridLayoutModule.GridLayout>p.content;
    var child = grid.getChildAt(0);

    var col = gridLayoutModule.GridLayout.getColumn(child);
    TKUnit.assertEqual(col, 2, "Expected result for grid column: 2; Actual result: " + col + ";");

    var row = gridLayoutModule.GridLayout.getRow(child);
    TKUnit.assertEqual(row, 1, "Expected result for grid row: 1; Actual result: " + row + ";");

    var colSpan = gridLayoutModule.GridLayout.getColumnSpan(child);
    TKUnit.assertEqual(colSpan, 4, "Expected result for grid column span: 4; Actual result: " + colSpan + ";");

    var rowSpan = gridLayoutModule.GridLayout.getRowSpan(child);
    TKUnit.assertEqual(rowSpan, 3, "Expected result for grid row span: 3; Actual result: " + rowSpan + ";");
}

export function test_parse_ShouldSetCanvasAttachedProperties() {
    var p = <Page>Builder.parse("<Page><AbsoluteLayout><Label left='1' top='2' right='3' bottom='4' /></AbsoluteLayout></Page>");
    var absLayout = <absoluteLayoutModule.AbsoluteLayout>p.content;
    var child = absLayout.getChildAt(0);

    var left = absoluteLayoutModule.AbsoluteLayout.getLeft(child);

    TKUnit.assert(Length.equals(left, Length.parse("1")), `Expected result for canvas left: 1; Actual result: ${(<any>left).value};`);

    var top = absoluteLayoutModule.AbsoluteLayout.getTop(child);
    TKUnit.assert(Length.equals(top, Length.parse("2")), `Expected result for canvas top: 2; Actual result: ${(<any>top).value};`);
}

export function test_parse_ShouldParseNumberProperties() {
    var p = <Page>Builder.parse("<Page width='100' />");
    TKUnit.assertTrue(PercentLength.equals(p.width, 100));
}

export function test_parse_ShouldParseBooleanProperties() {
    var p = <Page>Builder.parse("<Page><Switch checked='true' /></Page>");
    var sw = <switchModule.Switch>p.content;

    TKUnit.assertTrue(sw.checked, "Expected result: true; Actual result: " + sw.checked + "; type: " + typeof (sw.checked));
}

export function test_parse_ShouldParseBooleanPropertiesIgnoreCase() {
    var p = <Page>Builder.parse("<Page><Switch checked='False' /></Page>");
    var sw = <switchModule.Switch>p.content;

    TKUnit.assert(sw.checked === false, "Expected result: false; Actual result: " + sw.checked + "; type: " + typeof (sw.checked));
}

export function test_parse_ShouldParseBooleanPropertiesIgnoreCaseInverted() {
    var p = <Page>Builder.parse("<Page><TextField editable='False' /></Page>");
    var tf = <textFieldModule.TextField>p.content;

    TKUnit.assertFalse(tf.editable, "Expected result: false; Actual result: " + tf.editable + "; type: " + typeof (tf.editable));
}

export function test_parse_ShouldParsePlatformSpecificProperties() {
    var p = <Page>Builder.parse("<Page><TextField ios:editable='False' android:editable='True' /></Page>");
    var tf = <textFieldModule.TextField>p.content;

    if (platform.device.os === platform.platformNames.ios) {
        TKUnit.assertFalse(tf.editable, "Expected result: false; Actual result: " + tf.editable + "; type: " + typeof (tf.editable));
    } else {
        TKUnit.assertTrue(tf.editable, "Expected result: true; Actual result: " + tf.editable + "; type: " + typeof (tf.editable));
    }
}

export function test_parse_ShouldParsePlatformSpecificComponents() {
    var p = <Page>Builder.parse("<Page><ios><TextField /></ios><android><Label /></android></Page>");
    if (platform.device.os === platform.platformNames.ios) {
        TKUnit.assert(p.content instanceof textFieldModule.TextField, "Expected result: TextField; Actual result: " + p.content);
    }
    else {
        TKUnit.assert(p.content instanceof Label, "Expected result: Label; Actual result: " + p.content);
    }
}

export function test_parse_ThrowErrorWhenNestingPlatforms() {
    var e: Error;
    try {
        Builder.parse("<Page><ios><TextField /><android><Label /></android></ios></Page>");
    } catch (ex) {
        e = ex;
    }

    TKUnit.assert(e, "Expected result: Error; Actual result: " + e);
}

export function test_parse_ShouldParseBindings() {
    var p = <Page>Builder.parse("<Page><Switch checked='{{ myProp }}' /></Page>");
    p.bindingContext = { myProp: true };
    var sw = <switchModule.Switch>p.content;

    TKUnit.assertTrue(sw.checked, "Expected result: true; Actual result: " + sw.checked + "; type: " + typeof (sw.checked));
}

export function test_parse_ShouldParseBindingsWithObservable() {
    var p = <Page>Builder.parse("<Page><Switch checked='{{ myProp }}' /></Page>");
    var obj = new observable.Observable();
    obj.set("myProp", true);
    p.bindingContext = obj;
    var sw = <switchModule.Switch>p.content;

    TKUnit.assertTrue(sw.checked, "Expected result: true; Actual result: " + sw.checked + "; type: " + typeof (sw.checked));

    obj.set("myProp", false);

    TKUnit.assertFalse(sw.checked, "Expected result: false; Actual result: " + sw.checked + "; type: " + typeof (sw.checked));
}

export function test_parse_ShouldParseBindingsToEvents() {
    var p = <Page>Builder.parse("<Page><Button tap='{{ myTap }}' /></Page>");
    p.bindingContext = {
        myTap: function (args) {
            //
        }
    };
    var btn = <buttonModule.Button>p.content;

    TKUnit.assert(btn.hasListeners("tap"), "Expected result: true.");
}

export function test_parse_ShouldParseBindingsToEventsWithOn() {
    var p = <Page>Builder.parse("<Page><Button ontap='{{ myTap }}' /></Page>");
    p.bindingContext = {
        myTap: function (args) {
            //
        }
    };
    var btn = <buttonModule.Button>p.content;

    TKUnit.assert(btn.hasListeners("tap"), "Expected result: true.");
}

export function test_parse_ShouldParseBindingsToGestures() {
    var p = <Page>Builder.parse("<Page><Label tap='{{ myTap }}' /></Page>");
    var context = {
        myTap: function (args) {
            //
        }
    };

    p.bindingContext = context;
    var lbl = <Label>p.content;

    var observer = (<view.View>lbl).getGestureObservers(gesturesModule.GestureTypes.tap)[0];

    TKUnit.assert(observer !== undefined, "Expected result: true.");
    TKUnit.assert(observer.context === context, "Context should be equal to binding context. Actual result: " + observer.context);
}

export function test_parse_ShouldParseBindingsToGesturesWithOn() {
    var p = <Page>Builder.parse("<Page><Label ontap='{{ myTap }}' /></Page>");
    var context = {
        myTap: function (args) {
            //
        }
    };

    p.bindingContext = context;
    var lbl = <Label>p.content;

    var observer = (<view.View>lbl).getGestureObservers(gesturesModule.GestureTypes.tap)[0];

    TKUnit.assert(observer !== undefined, "Expected result: true.");
    TKUnit.assert(observer.context === context, "Context should be equal to binding context. Actual result: " + observer.context);
}

export function test_parse_ShouldParseSubProperties() {
    var p = <Page>Builder.parse("<Page><Switch style.visibility='collapse' checked='{{ myProp }}' /></Page>");
    var obj = new observable.Observable();
    obj.set("myProp", true);
    p.bindingContext = obj;
    var sw = <switchModule.Switch>p.content;

    TKUnit.assert(sw.visibility === "collapse", "Expected result: collapse; Actual result: " + sw.visibility + "; type: " + typeof (sw.visibility));
}

export function test_parse_ShouldParseBindingToSpecialProperty() {
    var classProp = "MyClass";
    var p = <Page>Builder.parse("<Page><Label class='{{ myProp }}' /></Page>");
    var obj = new observable.Observable();
    obj.set("myProp", classProp);
    p.bindingContext = obj;

    TKUnit.assertEqual(p.content.className, classProp);
    TKUnit.assertEqual(p.content.cssClasses.size, 1);
}

export function test_parse_ShouldParseBindingsWithCommaInsideSingleQuote() {
    var expected = "Hi,test";
    var bindingString = "{{ 'Hi,' + myProp }}";
    var p = <Page>Builder.parse("<Page><Label text=\"" + bindingString + "\" /></Page>");
    var obj = new observable.Observable();
    obj.set("myProp", "test");
    p.bindingContext = obj;
    var lbl = <Label>p.content;

    TKUnit.assert(lbl.text === expected, "Expected " + expected + "; Actual result: " + lbl.text + "; type: " + typeof (lbl.text));
}

export function test_parse_ShouldParseBindingsWithCommaInsideDoubleQuote() {
    var expected = "Hi,test";
    var bindingString = "{{ \"Hi,\" + myProp }}";
    var p = <Page>Builder.parse("<Page><Label text='" + bindingString + "' /></Page>");
    var obj = new observable.Observable();
    obj.set("myProp", "test");
    p.bindingContext = obj;
    var lbl = <Label>p.content;

    TKUnit.assert(lbl.text === expected, "Expected " + expected + "; Actual result: " + lbl.text + "; type: " + typeof (lbl.text));
}

export function test_parse_CanBindBackgroundImage() {
    var p = <Page>Builder.parse("<Page><StackLayout backgroundImage='{{ myProp }}' /></Page>");
    var expected = "~/assets/logo.png";
    var obj = new observable.Observable();
    obj.set("myProp", expected);
    p.bindingContext = obj;
    var sw = <stackLayoutModule.StackLayout>p.content;

    TKUnit.assert(sw.backgroundImage === expected, "Expected result: " + expected + "; Actual result: " + sw.backgroundImage);
}

export function test_parse_ShouldParseLowerCaseDashedComponentDeclaration() {
    var p = <Page>Builder.parse("<page><stack-layout><label text=\"Label\" /><segmented-bar><segmented-bar.items><segmented-bar-item title=\"test\" /></segmented-bar.items></segmented-bar></stack-layout></page>");
    var ctrl = <stackLayoutModule.StackLayout>p.content;

    TKUnit.assert(ctrl instanceof stackLayoutModule.StackLayout, "Expected result: StackLayout!; Actual result: " + ctrl);
    TKUnit.assert(ctrl.getChildAt(0) instanceof Label, "Expected result: Label!; Actual result: " + ctrl.getChildAt(0));
    TKUnit.assert(ctrl.getChildAt(1) instanceof segmentedBar.SegmentedBar, "Expected result: Label!; Actual result: " + ctrl.getChildAt(0));
}

export function test_parse_ShouldParseCustomComponentWithoutXml() {
    var p = <Page>Builder.parse("<Page xmlns:customControls=\"xml-declaration/mymodule\"><customControls:MyControl /></Page>");
    var ctrl = p.content;
    TKUnit.assertNotNull(ctrl);
    TKUnit.assertEqual(ctrl.className, "MyStackLayout", "Expected result custom control is created");
}

export function test_parse_ShouldParseCustomComponentWithoutXmlFromTNSModules() {
    var p = <Page>Builder.parse("<Page xmlns" + ":customControls=\"ui/label\"><customControls:Label /></Page>");
    var ctrl = p.content;

    TKUnit.assert(ctrl instanceof Label, "Expected result: custom control is defined!; Actual result: " + ctrl);
}

export function test_parse_ShouldParseCustomComponentWithoutXmlFromTNSModulesWhenNotSpecified() {
    var p = <Page>Builder.parse("<Page xmlns" + ":customControls=\"ui/label\"><customControls:Label /></Page>");
    var ctrl = p.content;

    TKUnit.assert(ctrl instanceof Label, "Expected result: custom control is defined!; Actual result: " + ctrl);
}

export function test_parse_ShouldParseCustomComponentWithXml() {
    var p = <Page>Builder.parse("<Page xmlns:customControls=\"xml-declaration/mymodulewithxml\"><customControls:MyControl /></Page>");
    var panel = <stackLayoutModule.StackLayout>p.content;
    var lbl = <Label>panel.getChildAt(0);

    TKUnit.assert(lbl.text === "mymodulewithxml", "Expected result: 'mymodulewithxml'; Actual result: " + lbl);
}

export function test_parse_ShouldParseCustomComponentWithXml_WithAttributes() {
    var p = <Page>Builder.parse("<Page xmlns:customControls=\"xml-declaration/mymodulewithxml\"><customControls:MyControl visibility=\"collapse\" /></Page>");
    var panel = <stackLayoutModule.StackLayout>p.content;

    TKUnit.assertEqual(panel.visibility, "collapse", "panel.visibility");
}

export function test_parse_ShouldParseCustomComponentWithXml_WithCustomAttributes() {
    var p = <Page>Builder.parse("<Page xmlns:customControls=\"xml-declaration/mymodulewithxml\"><customControls:MyControl myProperty=\"myValue\" /></Page>");
    var panel = <stackLayoutModule.StackLayout>p.content;

    TKUnit.assertEqual(panel["myProperty"], "myValue", "customControl.myProperty");
}

export function test_parse_ShouldParseCustomComponentWithXmlNoJS() {
    var p = <Page>Builder.parse("<Page xmlns:customControls=\"xml-declaration/mymodulewithxml\"><customControls:my-no-js-control /></Page>");
    var panel = <stackLayoutModule.StackLayout>p.content;
    var lbl = <Label>panel.getChildAt(0);

    TKUnit.assertEqual(lbl.text, "I'm all about taht XML, no JS", "label.text");
}

export function test_parse_ShouldParseCustomComponentWithXmlNoJS_WithAttributes() {
    var p = <Page>Builder.parse("<Page xmlns:customControls=\"xml-declaration/mymodulewithxml\"><customControls:my-no-js-control visibility=\"collapse\" /></Page>");
    var panel = <stackLayoutModule.StackLayout>p.content;

    TKUnit.assertEqual(panel.visibility, "collapse", "panel.visibility");
}

export function test_parse_ShouldParseCustomComponentWithXmlNoJS_WithCustomAttributes() {
    var p = <Page>Builder.parse("<Page xmlns:customControls=\"xml-declaration/mymodulewithxml\"><customControls:my-no-js-control myProperty=\"myValue\" /></Page>");
    var panel = <stackLayoutModule.StackLayout>p.content;

    TKUnit.assertEqual(panel["myProperty"], "myValue", "customControl.myProperty");
}

export function test_parse_ShouldParseCustomComponentWithoutXmlInListViewTemplate() {
    var p = <Page>Builder.parse("<Page xmlns:customControls=\"xml-declaration/mymodule\"><ListView items=\"{{ items }}\" itemLoading=\"{{ itemLoading }}\"><ListView.itemTemplate><customControls:MyControl /></ListView.itemTemplate></ListView></Page>");

    function testAction(views: Array<viewModule.View>) {
        let ctrl;
        let obj = new observable.Observable();
        obj.set("items", [1]);
        obj.set("itemLoading", function (args: listViewModule.ItemEventData) {
            ctrl = args.view;
        });
        p.bindingContext = obj;
        TKUnit.waitUntilReady(() => !!ctrl);
        TKUnit.assertNotNull(ctrl);
        TKUnit.assertEqual(ctrl.className, "MyStackLayout", "Expected result custom control is created");
    }

    helper.navigate(function () { return p; });
    testAction([p.content, p]);
}

export function test_parse_ShouldParseNestedListViewInListViewTemplate() {
    var p = <Page>Builder.parse("<Page xmlns=\"http://schemas.nativescript.org/tns.xsd\"><ListView items=\"{{ items }}\" itemLoading=\"{{ itemLoading }}\"><ListView.itemTemplate><ListView items=\"{{ subItems }}\" /></ListView.itemTemplate></ListView></Page>");

    function testAction(views: Array<viewModule.View>) {
        let ctrl;
        let obj = new observable.Observable();
        obj.set("items", [{ subItems: [1] }]);
        obj.set("itemLoading", function (args: listViewModule.ItemEventData) {
            ctrl = args.view;
        });
        p.bindingContext = obj;
        TKUnit.waitUntilReady(() => !!ctrl);
        TKUnit.assert(ctrl instanceof listViewModule.ListView, "Expected result: ListView!; Actual result: " + ctrl);
    }

    helper.navigate(function () { return p; });
    testAction([p.content, p]);
}

export function test_parse_ShouldEvaluateEventBindingExpressionInListViewTemplate() {
    var p = <Page>Builder.parse("<Page xmlns=\"http://schemas.nativescript.org/tns.xsd\"><ListView items=\"{{ items }}\" itemLoading=\"{{ itemLoading }}\"><ListView.itemTemplate><SegmentedBar items=\"{{ $parents['ListView'].segmentedBarItems }}\" selectedIndexChanged=\"{{ $parents['ListView'].changed }}\" /></ListView.itemTemplate></ListView></Page>");

    function testAction(views: Array<viewModule.View>) {
        let ctrl: segmentedBar.SegmentedBar = null;
        let changed;
        let obj = new observable.Observable();

        let firstItem = new segmentedBar.SegmentedBarItem();
        firstItem.title = "One";
        let secondItem = new segmentedBar.SegmentedBarItem();
        secondItem.title = "Two";
        let thirdItem = new segmentedBar.SegmentedBarItem();
        thirdItem.title = "Tree";
        let segmentedBarItems = [firstItem, secondItem, thirdItem];

        obj.set("items", [1, 2, 3]);
        obj.set("segmentedBarItems", segmentedBarItems);
        obj.set("itemLoading", function (args: listViewModule.ItemEventData) {
            ctrl = <segmentedBar.SegmentedBar>args.view;
        });

        obj.set("changed", function (args: observable.EventData) {
            changed = true;
        });

        p.bindingContext = obj;
        TKUnit.waitUntilReady(() => !!ctrl);
        ctrl.selectedIndex = 1;

        TKUnit.assert(changed, "Expected result: true!; Actual result: " + changed);
    }

    helper.navigate(function () { return p; });
    testAction([p.content, p]);
}

export function test_parse_NestedRepeaters() {
    var pageXML =
        "<Page xmlns='http://schemas.nativescript.org/tns.xsd'>" +
        "  <TabView>" +
        "    <TabView.items>" +
        "      <TabViewItem title='List'>" +
        "        <TabViewItem.view>" +
        "          <Repeater items='{{ $value }}'>" +
        "            <Repeater.itemTemplate>" +
        "              <StackLayout>" +
        "                <Repeater items='{{ $value }}'>" +
        "                  <Repeater.itemTemplate>" +
        "                    <Label text='{{ $value }}'/>" +
        "                  </Repeater.itemTemplate>" +
        "                </Repeater>" +
        "              </StackLayout>" +
        "            </Repeater.itemTemplate>" +
        "          </Repeater>" +
        "        </TabViewItem.view>" +
        "      </TabViewItem>" +
        "    </TabView.items>" +
        "  </TabView>" +
        "</Page>";
    var p = <Page>Builder.parse(pageXML);

    function testAction(views: Array<viewModule.View>) {
        p.bindingContext = [["0", "1"], ["2", "3"]];
        let lbls = new Array<Label>();
        view.eachDescendant(p, (v) => {
            if (v instanceof Label) {
                lbls.push(v);
            }

            return true;
        });

        TKUnit.assertEqual(lbls.length, 4, "labels count");
        lbls.forEach((lbl, index, arr) => {
            TKUnit.assertEqual(lbl.text.toString(), index.toString(), "label text");
        });
    }

    helper.navigate(function () { return p; });
    testAction([p.content, p]);
}

export function test_parseSpansDirectlyOnLabel() {
    var p = <Page>Builder.parse("<Page xmlns=\"http://schemas.nativescript.org/tns.xsd\" navigatedTo=\"pageNavigated\"><StackLayout><Label id=\"testLabel\"><Span text=\"We are\" fontSize=\"10\"/><Span text=\"Awesome\" fontWeight=\"bold\"/></Label></StackLayout></Page>");
    function testAction(views: Array<viewModule.View>) {
        var page = <Page>views[0];
        var testLabel = <Label>page.getViewById("testLabel");
        TKUnit.assertEqual(testLabel.formattedText + "", "We areAwesome", "formattedText");
        TKUnit.assertEqual(testLabel.text + "", "We areAwesome", "text");
    }

    helper.navigate(function () { return p; });
    testAction([p]);
}

export function test_parseSpansDirectlyOnButton() {
    var p = <Page>Builder.parse("<Page xmlns=\"http://schemas.nativescript.org/tns.xsd\" navigatedTo=\"pageNavigated\"><StackLayout><Button id=\"testButton\"><Span text=\"We are\" fontSize=\"10\"/><Span text=\"Awesome\" fontWeight=\"bold\"/></Button></StackLayout></Page>");
    function testAction(views: Array<viewModule.View>) {
        var page = <Page>views[0];
        var testButton = <Button>page.getViewById("testButton");
        TKUnit.assertEqual(testButton.formattedText + "", "We areAwesome", "formattedText");
        TKUnit.assertEqual(testButton.text + "", "We areAwesome", "text");
    }

    helper.navigate(function () { return p; });
    testAction([p]);
}

export function test_parseFormattedStringWithoutFormattedText() {
    var p = <Page>Builder.parse("<Page xmlns=\"http://schemas.nativescript.org/tns.xsd\" navigatedTo=\"pageNavigated\"><StackLayout><Button id=\"testButton\"><FormattedString><FormattedString.spans><Span text=\"author\"/><Span text=\" num_comments\"/></FormattedString.spans></FormattedString></Button></StackLayout></Page>");
    function testAction(views: Array<viewModule.View>) {
        var page = <Page>views[0];
        var testButton = <Button>page.getViewById("testButton");
        TKUnit.assertEqual(testButton.formattedText + "", "author num_comments", "formattedText");
        TKUnit.assertEqual(testButton.text + "", "author num_comments", "text");
    }

    helper.navigate(function () { return p; });
    testAction([p]);
}

export function test_parseFormattedStringFullSyntax() {
    var p = <Page>Builder.parse("<Page xmlns=\"http://schemas.nativescript.org/tns.xsd\" navigatedTo=\"pageNavigated\"><StackLayout><Button id=\"testButton\"><Button.formattedText><FormattedString><FormattedString.spans><Span text=\"author\"/><Span text=\" num_comments\"/></FormattedString.spans></FormattedString></Button.formattedText></Button></StackLayout></Page>");
    function testAction(views: Array<viewModule.View>) {
        var page = <Page>views[0];
        var testButton = <Button>page.getViewById("testButton");
        TKUnit.assertEqual(testButton.formattedText + "", "author num_comments", "formattedText");
        TKUnit.assertEqual(testButton.text + "", "author num_comments", "text");
    }

    helper.navigate(function () { return p; });
    testAction([p]);
}

export function test_parseSpansDirectlyToFormattedString() {
    var p = <Page>Builder.parse("<Page xmlns=\"http://schemas.nativescript.org/tns.xsd\" navigatedTo=\"pageNavigated\"><StackLayout><Button id=\"testButton\"><FormattedString><Span text=\"author\"/><Span text=\" num_comments\"/></FormattedString></Button></StackLayout></Page>");
    function testAction(views: Array<viewModule.View>) {
        var page = <Page>views[0];
        var testButton = <Button>page.getViewById("testButton");
        TKUnit.assertEqual(testButton.formattedText + "", "author num_comments", "formattedText");
        TKUnit.assertEqual(testButton.text + "", "author num_comments", "text");
    }

    helper.navigate(function () { return p; });
    testAction([p]);
}

export function test_searchbar_donotcrash_whentext_isempty() {
    var p = <Page>Builder.parse("<Page><SearchBar text=\"\" hint=\"Search\" /></Page>");
    var sb = <searchBarModule.SearchBar>p.content;

    TKUnit.assertEqual(sb.text, "");
}

export function test_searchbar_donotcrash_whentext_isspace() {
    var p = <Page>Builder.parse("<Page><SearchBar text=\" \" hint=\"Search\" /></Page>");
    var sb = <searchBarModule.SearchBar>p.content;

    TKUnit.assertEqual(sb.text, " ");
}

export function test_parse_template_property() {
    var page = <Page>Builder.load("xml-declaration/template-builder-tests/simple-template-page.xml");
    TKUnit.assert(page, "Expected root page.");
    var templateView = <TemplateView>page.getViewById("template-view");
    TKUnit.assert(templateView, "Expected TemplateView.");
    TKUnit.assert(templateView.template, "Expected the template of the TemplateView to be defined");

    TKUnit.assertEqual(templateView.getChildrenCount(), 0, "Expected TemplateView initially to have no children.");
    templateView.parseTemplate();
    TKUnit.assertEqual(templateView.getChildrenCount(), 1, "Expected TemplateView initially to have 1 child.");
    var button = <Button>templateView.getChildAt(0);
    TKUnit.assert(button, "Expected the TemplateView's template to create a button child.");
    TKUnit.assertEqual(button.text, "Click!", "Expected child Button to have text 'Click!'");
}

export function test_NonExistingElementError() {
    var basePath = "xml-declaration/";
    var expectedErrorStart =
        "Building UI from XML. @" + basePath + "errors/non-existing-element.xml:11:5\n" +
        " > Module 'ui/unicorn' not found for element 'Unicorn'.";
    var message;
    try {
        Builder.load("xml-declaration/errors/non-existing-element.xml");
    } catch (e) {
        message = e.message;
    }
    TKUnit.assertEqual(message.substr(0, expectedErrorStart.length), expectedErrorStart, "Expected load to throw, and the message to start with specific string");
}

export function test_NonExistingElementInTemplateError() {
    var basePath = "xml-declaration/";
    var expectedErrorStart =
        "Building UI from XML. @" + basePath + "errors/non-existing-element-in-template.xml:14:17\n" +
        " > Module 'ui/unicorn' not found for element 'Unicorn'.";
    var message;
    var page = Builder.load("xml-declaration/errors/non-existing-element-in-template.xml");
    TKUnit.assert(view, "Expected the xml to generate a page");
    var templateView = <TemplateView>page.getViewById("template-view");
    TKUnit.assert(templateView, "Expected the page to have a TemplateView with 'temaplte-view' id.");

    try {
        templateView.parseTemplate();
    } catch (e) {
        message = e.message;
    }
    TKUnit.assertEqual(message.substr(0, expectedErrorStart.length), expectedErrorStart, "Expected load to throw, and the message to start with specific string");
}

export function test_EventInTemplate() {
    var pageCode = global.loadModule("xml-declaration/template-builder-tests/event-in-template", true);
    var notified = false;
    pageCode.test = (args) => {
        notified = true;
    };

    var page = Builder.load("xml-declaration/template-builder-tests/event-in-template.xml", pageCode);
    TKUnit.assert(view, "Expected the xml to generate a page");
    var templateView = <TemplateView>page.getViewById("template-view");
    TKUnit.assert(templateView, "Expected the page to have a TemplateView with 'temaplte-view' id.");
    templateView.parseTemplate();
    TKUnit.assertEqual(templateView.getChildrenCount(), 1, "Expected TemplateView initially to have 1 child.");
    var childTemplateView = <TemplateView>templateView.getChildAt(0);
    TKUnit.assert(childTemplateView, "Expected the TemplateView's template to create a child TemplateView.");
    childTemplateView.notify({
        eventName: "test",
        object: childTemplateView
    });

    TKUnit.assert(notified, "Expected the child to raise the test event.");
}

export function test_EventInCodelessFragment() {
    var pageCode = global.loadModule("./xml-declaration/template-builder-tests/event-in-codeless-fragment", true);

    var notified = false;
    pageCode.setCallback((args) => {
        notified = true;
    });

    var page = Builder.load("./xml-declaration/template-builder-tests/event-in-codeless-fragment.xml", pageCode);
    TKUnit.assert(view, "Expected the xml to generate a page");
    var templateView = <TemplateView>page.getViewById("template-view");
    TKUnit.assert(templateView, "Expected the page to have a TemplateView with 'temaplte-view' id.");
    templateView.parseTemplate();
    TKUnit.assertEqual(templateView.getChildrenCount(), 1, "Expected TemplateView initially to have 1 child.");
    var childTemplateView = <TemplateView>templateView.getChildAt(0);
    TKUnit.assert(childTemplateView, "Expected the TemplateView's template to create a child TemplateView.");
    childTemplateView.notify({
        eventName: "test",
        object: childTemplateView
    });

    TKUnit.assert(notified, "Expected the child to raise the test event.");
}

export function test_tabview_selectedindex_will_work_from_xml() {
    var p = <Page>Builder.parse(
        "<Page>" +
        "<TabView selectedIndex= \"1\">" +
        "<TabView.items>" +
        "<TabViewItem title=\"First\">" +
        "<TabViewItem.view>" +
        "<Label text=\"First View\" />" +
        "</TabViewItem.view>" +
        "</TabViewItem>" +
        "<TabViewItem title= \"Second\">" +
        "<TabViewItem.view>" +
        "<Label text=\"Second View\" />" +
        "</TabViewItem.view>" +
        "</TabViewItem>" +
        "</TabView.items>" +
        "</TabView>" +
        "</Page>");

    function testAction(views: Array<viewModule.View>) {
        let tab: TabView = <TabView>p.content;
        TKUnit.assertEqual(tab.selectedIndex, 1);
    }

    helper.navigate(function () { return p; });
    testAction([p.content, p]);
}

export function test_TabViewHasCorrectParentChain() {
    var testFunc = function (page: Page) {
        TKUnit.assert(page.bindingContext.get("testPassed"));
    };

    var model = new Observable();
    model.set("testPassed", false);
    helper.navigateToModuleAndRunTest("xml-declaration/mymodulewithxml/TabViewParentChainPage", model, testFunc);
}

export function test_hasSourceCodeLocations() {
    var basePath = "xml-declaration/";
    var page = <Page>Builder.load(basePath + "examples/test-page.xml");
    var grid = page.getViewById("grid");
    var gridSource = Source.get(grid);
    TKUnit.assertEqual(gridSource.toString(), basePath + "examples/test-page.xml:2:3");
    var label = page.getViewById("label");
    var labelSource = Source.get(label);
    TKUnit.assertEqual(labelSource.toString(), basePath + "examples/test-page.xml:3:5");
}

export function test_Setting_digits_for_text_Label_is_not_converted_to_number() {
    var p = <Page>Builder.parse("<Page><Label id=\"testLabel\" text=\"01234\"/></Page>");
    var testLabel = <Label>p.getViewById("testLabel");
    TKUnit.assertEqual(testLabel.text, "01234");
}

export function test_Setting_digits_for_text_Button_is_not_converted_to_number() {
    var p = <Page>Builder.parse("<Page><Button id=\"testButton\" text=\"01234\"/></Page>");
    var testButton = <Button>p.getViewById("testButton");
    TKUnit.assertEqual(testButton.text, "01234");
}
