const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const uuidv1 = require('uuid/v1');
const fs = require('fs');

const Post = require('../models/Tag');
const fn = uuidv1();

const docsettings = [{
    size: "LETTER"
}];
const fallback = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKQAAACkCAYAAAAZtYVBAAAACXBIWXMAAA7EAAAOxAGVKw4bAAABzUlEQVR4nO3SMQEAIAzAMMC/5/HigB6Jgh7dMzMLIs7vAHgZkhRDkmJIUgxJiiFJMSQphiTFkKQYkhRDkmJIUgxJiiFJMSQphiTFkKQYkhRDkmJIUgxJiiFJMSQphiTFkKQYkhRDkmJIUgxJiiFJMSQphiTFkKQYkhRDkmJIUgxJiiFJMSQphiTFkKQYkhRDkmJIUgxJiiFJMSQphiTFkKQYkhRDkmJIUgxJiiFJMSQphiTFkKQYkhRDkmJIUgxJiiFJMSQphiTFkKQYkhRDkmJIUgxJiiFJMSQphiTFkKQYkhRDkmJIUgxJiiFJMSQphiTFkKQYkhRDkmJIUgxJiiFJMSQphiTFkKQYkhRDkmJIUgxJiiFJMSQphiTFkKQYkhRDkmJIUgxJiiFJMSQphiTFkKQYkhRDkmJIUgxJiiFJMSQphiTFkKQYkhRDkmJIUgxJiiFJMSQphiTFkKQYkhRDkmJIUgxJiiFJMSQphiTFkKQYkhRDkmJIUgxJiiFJMSQphiTFkKQYkhRDkmJIUgxJiiFJMSQphiTFkKQYkhRDkmJIUgxJiiFJMSQphiTFkKQYkhRDkmJIUgxJiiFJMSQphiTFkKQYkhRDknIBq5IFRPtkqyYAAAAASUVORK5CYII=";
const dpath = [`<?xml version="1.0" encoding="utf-8"?>
<!-- Generator: Adobe Illustrator 23.0.4, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd" [
    <!ENTITY ns_extend "http://ns.adobe.com/Extensibility/1.0/">
    <!ENTITY ns_ai "http://ns.adobe.com/AdobeIllustrator/10.0/">
    <!ENTITY ns_graphs "http://ns.adobe.com/Graphs/1.0/">
    <!ENTITY ns_vars "http://ns.adobe.com/Variables/1.0/">
    <!ENTITY ns_imrep "http://ns.adobe.com/ImageReplacement/1.0/">
    <!ENTITY ns_sfw "http://ns.adobe.com/SaveForWeb/1.0/">
    <!ENTITY ns_custom "http://ns.adobe.com/GenericCustomNamespace/1.0/">
    <!ENTITY ns_adobe_xpath "http://ns.adobe.com/XPath/1.0/">
]>
<svg version="1.1" id="Layer_1" xmlns:x="&ns_extend;" xmlns:i="&ns_ai;" xmlns:graph="&ns_graphs;"
     xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 612 792"
     style="enable-background:new 0 0 612 792;" xml:space="preserve">
<style type="text/css">
    .st0{clip-path:url(#SVGID_2_);}
    .st1{clip-path:url(#SVGID_4_);}
    .st2{clip-path:url(#SVGID_6_);}
    .st3{clip-path:url(#SVGID_8_);}
    .st4{clip-path:url(#SVGID_10_);}
    .st5{clip-path:url(#SVGID_12_);}
    .st6{clip-path:url(#SVGID_14_);fill:none;stroke:#060706;stroke-miterlimit:10;}
    .st7{clip-path:url(#SVGID_16_);}
    .st8{clip-path:url(#SVGID_18_);}
    .st9{clip-path:url(#SVGID_20_);}
    .st10{clip-path:url(#SVGID_22_);}
    .st11{clip-path:url(#SVGID_24_);}
    .st12{clip-path:url(#SVGID_26_);}
    .st13{clip-path:url(#SVGID_28_);fill:none;stroke:#060706;stroke-miterlimit:10;}
    .st14{clip-path:url(#SVGID_30_);}
    .st15{clip-path:url(#SVGID_32_);}
    .st16{clip-path:url(#SVGID_34_);}
    .st17{clip-path:url(#SVGID_36_);}
    .st18{clip-path:url(#SVGID_38_);}
    .st19{clip-path:url(#SVGID_40_);}
    .st20{clip-path:url(#SVGID_42_);fill:none;stroke:#060706;stroke-miterlimit:10;}
    .st21{clip-path:url(#SVGID_44_);}
    .st22{clip-path:url(#SVGID_46_);}
    .st23{clip-path:url(#SVGID_48_);}
    .st24{clip-path:url(#SVGID_50_);}
    .st25{clip-path:url(#SVGID_52_);}
    .st26{clip-path:url(#SVGID_54_);}
    .st27{clip-path:url(#SVGID_56_);fill:none;stroke:#060706;stroke-miterlimit:10;}
    .st28{clip-path:url(#SVGID_58_);}
    .st29{clip-path:url(#SVGID_60_);}
    .st30{clip-path:url(#SVGID_62_);}
    .st31{clip-path:url(#SVGID_64_);}
    .st32{clip-path:url(#SVGID_66_);}
    .st33{clip-path:url(#SVGID_68_);}
    .st34{clip-path:url(#SVGID_70_);fill:none;stroke:#060706;stroke-miterlimit:10;}
    .st35{clip-path:url(#SVGID_72_);}
    .st36{clip-path:url(#SVGID_74_);}
    .st37{clip-path:url(#SVGID_76_);}
    .st38{clip-path:url(#SVGID_78_);}
    .st39{clip-path:url(#SVGID_80_);}
    .st40{clip-path:url(#SVGID_82_);}
    .st41{clip-path:url(#SVGID_84_);fill:none;stroke:#060706;stroke-miterlimit:10;}
    .st42{clip-path:url(#SVGID_86_);}
    .st43{clip-path:url(#SVGID_88_);}
    .st44{clip-path:url(#SVGID_90_);}
    .st45{clip-path:url(#SVGID_92_);}
    .st46{clip-path:url(#SVGID_94_);}
    .st47{clip-path:url(#SVGID_96_);}
    .st48{clip-path:url(#SVGID_98_);fill:none;stroke:#060706;stroke-miterlimit:10;}
    .st49{clip-path:url(#SVGID_100_);}
    .st50{clip-path:url(#SVGID_102_);}
    .st51{clip-path:url(#SVGID_104_);}
    .st52{clip-path:url(#SVGID_106_);}
    .st53{clip-path:url(#SVGID_108_);}
    .st54{clip-path:url(#SVGID_110_);}
    .st55{clip-path:url(#SVGID_112_);fill:none;stroke:#060706;stroke-miterlimit:10;}
    .st56{clip-path:url(#SVGID_114_);}
    .st57{clip-path:url(#SVGID_116_);}
    .st58{clip-path:url(#SVGID_118_);}
    .st59{clip-path:url(#SVGID_120_);}
    .st60{clip-path:url(#SVGID_122_);}
    .st61{clip-path:url(#SVGID_124_);}
    .st62{clip-path:url(#SVGID_126_);fill:none;stroke:#060706;stroke-miterlimit:10;}
    .st63{clip-path:url(#SVGID_128_);}
    .st64{clip-path:url(#SVGID_130_);}
    .st65{clip-path:url(#SVGID_132_);}
    .st66{clip-path:url(#SVGID_134_);}
    .st67{clip-path:url(#SVGID_136_);}
    .st68{clip-path:url(#SVGID_138_);}
    .st69{clip-path:url(#SVGID_140_);fill:none;stroke:#060706;stroke-miterlimit:10;}
    .st70{clip-path:url(#SVGID_142_);}
    .st71{clip-path:url(#SVGID_144_);}
    .st72{clip-path:url(#SVGID_146_);}
    .st73{clip-path:url(#SVGID_150_);}
    .st74{clip-path:url(#SVGID_152_);}
    .st75{clip-path:url(#SVGID_154_);}
    .st76{clip-path:url(#SVGID_158_);}
    .st77{clip-path:url(#SVGID_160_);}
    .st78{clip-path:url(#SVGID_162_);}
    .st79{clip-path:url(#SVGID_166_);}
    .st80{clip-path:url(#SVGID_168_);}
    .st81{clip-path:url(#SVGID_170_);}
    .st82{clip-path:url(#SVGID_174_);}
    .st83{clip-path:url(#SVGID_176_);}
    .st84{clip-path:url(#SVGID_178_);}
    .st85{clip-path:url(#SVGID_182_);}
    .st86{clip-path:url(#SVGID_184_);}
    .st87{clip-path:url(#SVGID_186_);}
    .st88{clip-path:url(#SVGID_190_);}
    .st89{clip-path:url(#SVGID_192_);}
    .st90{clip-path:url(#SVGID_194_);}
    .st91{clip-path:url(#SVGID_198_);}
    .st92{clip-path:url(#SVGID_200_);}
    .st93{clip-path:url(#SVGID_202_);}
    .st94{clip-path:url(#SVGID_206_);}
    .st95{clip-path:url(#SVGID_208_);}
    .st96{clip-path:url(#SVGID_210_);}
    .st97{fill:#83D3FF;}
    .st98{clip-path:url(#SVGID_214_);}
    .st99{clip-path:url(#SVGID_216_);}
    .st100{clip-path:url(#SVGID_218_);}
    .st101{fill:none;}
    .st102{font-family:'MyriadPro-Regular';}
    .st103{font-size:22px;}
    .st104{fill:#33A3FF;}
    .st105{font-family:'Futura-Medium';}
    .st106{font-size:13.0419px;}
    .st107{fill:#AFAEAE;}
    .st108{fill:#64D3FF;}
    .st109{fill:#AAAAAA;}
    .st110{fill:#41BCF2;}
</style>
<metadata>
    <sfw  xmlns="&ns_sfw;">
        <slices></slices>
        <sliceSourceBounds  bottomLeftOrigin="true" height="722" width="592" x="10" y="35"></sliceSourceBounds>
    </sfw>
</metadata>
<g>
    <defs>
        <rect id="SVGID_1_" x="11" y="36" width="289" height="144"/>
    </defs>
    <clipPath id="SVGID_2_">
        <use xlink:href="#SVGID_1_"  style="overflow:visible;"/>
    </clipPath>
    <g class="st0">
        <defs>
            <rect id="SVGID_3_" x="11" y="36" width="289" height="144"/>
        </defs>
        <clipPath id="SVGID_4_">
            <use xlink:href="#SVGID_3_"  style="overflow:visible;"/>
        </clipPath>
        <g class="st1">
            <defs>
                <rect id="SVGID_5_" x="11" y="36" width="289" height="144"/>
            </defs>
            <clipPath id="SVGID_6_">
                <use xlink:href="#SVGID_5_"  style="overflow:visible;"/>
            </clipPath>
            <g class="st2">
                <defs>
                    <path id="SVGID_7_" d="M25.6,36c-7.95,0-14.4,6.45-14.4,14.4v115.2c0,7.95,6.45,14.4,14.4,14.4h259.2
                        c7.95,0,14.4-6.45,14.4-14.4V50.4c0-7.95-6.45-14.4-14.4-14.4H25.6z"/>
                </defs>
                <clipPath id="SVGID_8_">
                    <use xlink:href="#SVGID_7_"  style="overflow:visible;"/>
                </clipPath>
                <g class="st3">
                    <defs>
                        <rect id="SVGID_9_" x="10" y="35" width="290" height="146"/>
                    </defs>
                    <clipPath id="SVGID_10_">
                        <use xlink:href="#SVGID_9_"  style="overflow:visible;"/>
                    </clipPath>
                    <g class="st4">
                        <defs>
                            <rect id="SVGID_11_" x="10" y="35" width="290" height="146"/>
                        </defs>
                        <clipPath id="SVGID_12_">
                            <use xlink:href="#SVGID_11_"  style="overflow:visible;"/>
                        </clipPath>
                        <g class="st5">
                            <defs>
                                <rect id="SVGID_13_" x="10" y="35" width="290" height="146"/>
                            </defs>
                            <clipPath id="SVGID_14_">
                                <use xlink:href="#SVGID_13_"  style="overflow:visible;"/>
                            </clipPath>
                            <path class="st6" d="M25.6,180c-7.95,0-14.4-6.45-14.4-14.4V50.4c0-7.95,6.45-14.4,14.4-14.4h259.2
                                c7.95,0,14.4,6.45,14.4,14.4v115.2c0,7.95-6.45,14.4-14.4,14.4H25.6z"/>
                        </g>
                    </g>
                </g>
            </g>
        </g>
    </g>
</g>
<g>
    <defs>
        <rect id="SVGID_15_" x="312" y="36" width="289" height="144"/>
    </defs>
    <clipPath id="SVGID_16_">
        <use xlink:href="#SVGID_15_"  style="overflow:visible;"/>
    </clipPath>
    <g class="st7">
        <defs>
            <rect id="SVGID_17_" x="312" y="36" width="289" height="144"/>
        </defs>
        <clipPath id="SVGID_18_">
            <use xlink:href="#SVGID_17_"  style="overflow:visible;"/>
        </clipPath>
        <g class="st8">
            <defs>
                <rect id="SVGID_19_" x="312" y="36" width="289" height="144"/>
            </defs>
            <clipPath id="SVGID_20_">
                <use xlink:href="#SVGID_19_"  style="overflow:visible;"/>
            </clipPath>
            <g class="st9">
                <defs>
                    <path id="SVGID_21_" d="M327.15,36c-7.95,0-14.4,6.45-14.4,14.4v115.2c0,7.95,6.45,14.4,14.4,14.4h259.2
                        c7.95,0,14.4-6.45,14.4-14.4V50.4c0-7.95-6.45-14.4-14.4-14.4H327.15z"/>
                </defs>
                <clipPath id="SVGID_22_">
                    <use xlink:href="#SVGID_21_"  style="overflow:visible;"/>
                </clipPath>
                <g class="st10">
                    <defs>
                        <rect id="SVGID_23_" x="312" y="35" width="290" height="146"/>
                    </defs>
                    <clipPath id="SVGID_24_">
                        <use xlink:href="#SVGID_23_"  style="overflow:visible;"/>
                    </clipPath>
                    <g class="st11">
                        <defs>
                            <rect id="SVGID_25_" x="312" y="35" width="290" height="146"/>
                        </defs>
                        <clipPath id="SVGID_26_">
                            <use xlink:href="#SVGID_25_"  style="overflow:visible;"/>
                        </clipPath>
                        <g class="st12">
                            <defs>
                                <rect id="SVGID_27_" x="312" y="35" width="290" height="146"/>
                            </defs>
                            <clipPath id="SVGID_28_">
                                <use xlink:href="#SVGID_27_"  style="overflow:visible;"/>
                            </clipPath>
                            <path class="st13" d="M327.15,180c-7.95,0-14.4-6.45-14.4-14.4V50.4c0-7.95,6.45-14.4,14.4-14.4h259.2
                                c7.95,0,14.4,6.45,14.4,14.4v115.2c0,7.95-6.45,14.4-14.4,14.4H327.15z"/>
                        </g>
                    </g>
                </g>
            </g>
        </g>
    </g>
</g>
<g>
    <defs>
        <rect id="SVGID_29_" x="11" y="180" width="289" height="144"/>
    </defs>
    <clipPath id="SVGID_30_">
        <use xlink:href="#SVGID_29_"  style="overflow:visible;"/>
    </clipPath>
    <g class="st14">
        <defs>
            <rect id="SVGID_31_" x="11" y="180" width="289" height="144"/>
        </defs>
        <clipPath id="SVGID_32_">
            <use xlink:href="#SVGID_31_"  style="overflow:visible;"/>
        </clipPath>
        <g class="st15">
            <defs>
                <rect id="SVGID_33_" x="11" y="180" width="289" height="144"/>
            </defs>
            <clipPath id="SVGID_34_">
                <use xlink:href="#SVGID_33_"  style="overflow:visible;"/>
            </clipPath>
            <g class="st16">
                <defs>
                    <path id="SVGID_35_" d="M25.6,180c-7.95,0-14.4,6.45-14.4,14.4v115.2c0,7.95,6.45,14.4,14.4,14.4h259.2
                        c7.95,0,14.4-6.45,14.4-14.4V194.4c0-7.95-6.45-14.4-14.4-14.4H25.6z"/>
                </defs>
                <clipPath id="SVGID_36_">
                    <use xlink:href="#SVGID_35_"  style="overflow:visible;"/>
                </clipPath>
                <g class="st17">
                    <defs>
                        <rect id="SVGID_37_" x="10" y="179" width="290" height="146"/>
                    </defs>
                    <clipPath id="SVGID_38_">
                        <use xlink:href="#SVGID_37_"  style="overflow:visible;"/>
                    </clipPath>
                    <g class="st18">
                        <defs>
                            <rect id="SVGID_39_" x="10" y="179" width="290" height="146"/>
                        </defs>
                        <clipPath id="SVGID_40_">
                            <use xlink:href="#SVGID_39_"  style="overflow:visible;"/>
                        </clipPath>
                        <g class="st19">
                            <defs>
                                <rect id="SVGID_41_" x="10" y="179" width="290" height="146"/>
                            </defs>
                            <clipPath id="SVGID_42_">
                                <use xlink:href="#SVGID_41_"  style="overflow:visible;"/>
                            </clipPath>
                            <path class="st20" d="M25.6,324c-7.95,0-14.4-6.45-14.4-14.4V194.4c0-7.95,6.45-14.4,14.4-14.4h259.2
                                c7.95,0,14.4,6.45,14.4,14.4v115.2c0,7.95-6.45,14.4-14.4,14.4H25.6z"/>
                        </g>
                    </g>
                </g>
            </g>
        </g>
    </g>
</g>
<g>
    <defs>
        <rect id="SVGID_43_" x="312" y="180" width="289" height="144"/>
    </defs>
    <clipPath id="SVGID_44_">
        <use xlink:href="#SVGID_43_"  style="overflow:visible;"/>
    </clipPath>
    <g class="st21">
        <defs>
            <rect id="SVGID_45_" x="312" y="180" width="289" height="144"/>
        </defs>
        <clipPath id="SVGID_46_">
            <use xlink:href="#SVGID_45_"  style="overflow:visible;"/>
        </clipPath>
        <g class="st22">
            <defs>
                <rect id="SVGID_47_" x="312" y="180" width="289" height="144"/>
            </defs>
            <clipPath id="SVGID_48_">
                <use xlink:href="#SVGID_47_"  style="overflow:visible;"/>
            </clipPath>
            <g class="st23">
                <defs>
                    <path id="SVGID_49_" d="M327.15,180c-7.95,0-14.4,6.45-14.4,14.4v115.2c0,7.95,6.45,14.4,14.4,14.4h259.2
                        c7.95,0,14.4-6.45,14.4-14.4V194.4c0-7.95-6.45-14.4-14.4-14.4H327.15z"/>
                </defs>
                <clipPath id="SVGID_50_">
                    <use xlink:href="#SVGID_49_"  style="overflow:visible;"/>
                </clipPath>
                <g class="st24">
                    <defs>
                        <rect id="SVGID_51_" x="312" y="179" width="290" height="146"/>
                    </defs>
                    <clipPath id="SVGID_52_">
                        <use xlink:href="#SVGID_51_"  style="overflow:visible;"/>
                    </clipPath>
                    <g class="st25">
                        <defs>
                            <rect id="SVGID_53_" x="312" y="179" width="290" height="146"/>
                        </defs>
                        <clipPath id="SVGID_54_">
                            <use xlink:href="#SVGID_53_"  style="overflow:visible;"/>
                        </clipPath>
                        <g class="st26">
                            <defs>
                                <rect id="SVGID_55_" x="312" y="179" width="290" height="146"/>
                            </defs>
                            <clipPath id="SVGID_56_">
                                <use xlink:href="#SVGID_55_"  style="overflow:visible;"/>
                            </clipPath>
                            <path class="st27" d="M327.15,324c-7.95,0-14.4-6.45-14.4-14.4V194.4c0-7.95,6.45-14.4,14.4-14.4h259.2
                                c7.95,0,14.4,6.45,14.4,14.4v115.2c0,7.95-6.45,14.4-14.4,14.4H327.15z"/>
                        </g>
                    </g>
                </g>
            </g>
        </g>
    </g>
</g>
<g>
    <defs>
        <rect id="SVGID_57_" x="11" y="324" width="289" height="144"/>
    </defs>
    <clipPath id="SVGID_58_">
        <use xlink:href="#SVGID_57_"  style="overflow:visible;"/>
    </clipPath>
    <g class="st28">
        <defs>
            <rect id="SVGID_59_" x="11" y="324" width="289" height="144"/>
        </defs>
        <clipPath id="SVGID_60_">
            <use xlink:href="#SVGID_59_"  style="overflow:visible;"/>
        </clipPath>
        <g class="st29">
            <defs>
                <rect id="SVGID_61_" x="11" y="324" width="289" height="144"/>
            </defs>
            <clipPath id="SVGID_62_">
                <use xlink:href="#SVGID_61_"  style="overflow:visible;"/>
            </clipPath>
            <g class="st30">
                <defs>
                    <path id="SVGID_63_" d="M25.6,324c-7.95,0-14.4,6.45-14.4,14.4v115.2c0,7.95,6.45,14.4,14.4,14.4h259.2
                        c7.95,0,14.4-6.45,14.4-14.4V338.4c0-7.95-6.45-14.4-14.4-14.4H25.6z"/>
                </defs>
                <clipPath id="SVGID_64_">
                    <use xlink:href="#SVGID_63_"  style="overflow:visible;"/>
                </clipPath>
                <g class="st31">
                    <defs>
                        <rect id="SVGID_65_" x="10" y="323" width="290" height="146"/>
                    </defs>
                    <clipPath id="SVGID_66_">
                        <use xlink:href="#SVGID_65_"  style="overflow:visible;"/>
                    </clipPath>
                    <g class="st32">
                        <defs>
                            <rect id="SVGID_67_" x="10" y="323" width="290" height="146"/>
                        </defs>
                        <clipPath id="SVGID_68_">
                            <use xlink:href="#SVGID_67_"  style="overflow:visible;"/>
                        </clipPath>
                        <g class="st33">
                            <defs>
                                <rect id="SVGID_69_" x="10" y="323" width="290" height="146"/>
                            </defs>
                            <clipPath id="SVGID_70_">
                                <use xlink:href="#SVGID_69_"  style="overflow:visible;"/>
                            </clipPath>
                            <path class="st34" d="M25.6,468c-7.95,0-14.4-6.45-14.4-14.4V338.4c0-7.95,6.45-14.4,14.4-14.4h259.2
                                c7.95,0,14.4,6.45,14.4,14.4v115.2c0,7.95-6.45,14.4-14.4,14.4H25.6z"/>
                        </g>
                    </g>
                </g>
            </g>
        </g>
    </g>
</g>
<g>
    <defs>
        <rect id="SVGID_71_" x="312" y="324" width="289" height="144"/>
    </defs>
    <clipPath id="SVGID_72_">
        <use xlink:href="#SVGID_71_"  style="overflow:visible;"/>
    </clipPath>
    <g class="st35">
        <defs>
            <rect id="SVGID_73_" x="312" y="324" width="289" height="144"/>
        </defs>
        <clipPath id="SVGID_74_">
            <use xlink:href="#SVGID_73_"  style="overflow:visible;"/>
        </clipPath>
        <g class="st36">
            <defs>
                <rect id="SVGID_75_" x="312" y="324" width="289" height="144"/>
            </defs>
            <clipPath id="SVGID_76_">
                <use xlink:href="#SVGID_75_"  style="overflow:visible;"/>
            </clipPath>
            <g class="st37">
                <defs>
                    <path id="SVGID_77_" d="M327.15,324c-7.95,0-14.4,6.45-14.4,14.4v115.2c0,7.95,6.45,14.4,14.4,14.4h259.2
                        c7.95,0,14.4-6.45,14.4-14.4V338.4c0-7.95-6.45-14.4-14.4-14.4H327.15z"/>
                </defs>
                <clipPath id="SVGID_78_">
                    <use xlink:href="#SVGID_77_"  style="overflow:visible;"/>
                </clipPath>
                <g class="st38">
                    <defs>
                        <rect id="SVGID_79_" x="312" y="323" width="290" height="146"/>
                    </defs>
                    <clipPath id="SVGID_80_">
                        <use xlink:href="#SVGID_79_"  style="overflow:visible;"/>
                    </clipPath>
                    <g class="st39">
                        <defs>
                            <rect id="SVGID_81_" x="312" y="323" width="290" height="146"/>
                        </defs>
                        <clipPath id="SVGID_82_">
                            <use xlink:href="#SVGID_81_"  style="overflow:visible;"/>
                        </clipPath>
                        <g class="st40">
                            <defs>
                                <rect id="SVGID_83_" x="312" y="323" width="290" height="146"/>
                            </defs>
                            <clipPath id="SVGID_84_">
                                <use xlink:href="#SVGID_83_"  style="overflow:visible;"/>
                            </clipPath>
                            <path class="st41" d="M327.15,468c-7.95,0-14.4-6.45-14.4-14.4V338.4c0-7.95,6.45-14.4,14.4-14.4h259.2
                                c7.95,0,14.4,6.45,14.4,14.4v115.2c0,7.95-6.45,14.4-14.4,14.4H327.15z"/>
                        </g>
                    </g>
                </g>
            </g>
        </g>
    </g>
</g>
<g>
    <defs>
        <rect id="SVGID_85_" x="11" y="468" width="289" height="144"/>
    </defs>
    <clipPath id="SVGID_86_">
        <use xlink:href="#SVGID_85_"  style="overflow:visible;"/>
    </clipPath>
    <g class="st42">
        <defs>
            <rect id="SVGID_87_" x="11" y="468" width="289" height="144"/>
        </defs>
        <clipPath id="SVGID_88_">
            <use xlink:href="#SVGID_87_"  style="overflow:visible;"/>
        </clipPath>
        <g class="st43">
            <defs>
                <rect id="SVGID_89_" x="11" y="468" width="289" height="144"/>
            </defs>
            <clipPath id="SVGID_90_">
                <use xlink:href="#SVGID_89_"  style="overflow:visible;"/>
            </clipPath>
            <g class="st44">
                <defs>
                    <path id="SVGID_91_" d="M25.6,468c-7.95,0-14.4,6.45-14.4,14.4v115.2c0,7.95,6.45,14.4,14.4,14.4h259.2
                        c7.95,0,14.4-6.45,14.4-14.4V482.4c0-7.95-6.45-14.4-14.4-14.4H25.6z"/>
                </defs>
                <clipPath id="SVGID_92_">
                    <use xlink:href="#SVGID_91_"  style="overflow:visible;"/>
                </clipPath>
                <g class="st45">
                    <defs>
                        <rect id="SVGID_93_" x="10" y="467" width="290" height="146"/>
                    </defs>
                    <clipPath id="SVGID_94_">
                        <use xlink:href="#SVGID_93_"  style="overflow:visible;"/>
                    </clipPath>
                    <g class="st46">
                        <defs>
                            <rect id="SVGID_95_" x="10" y="467" width="290" height="146"/>
                        </defs>
                        <clipPath id="SVGID_96_">
                            <use xlink:href="#SVGID_95_"  style="overflow:visible;"/>
                        </clipPath>
                        <g class="st47">
                            <defs>
                                <rect id="SVGID_97_" x="10" y="467" width="290" height="146"/>
                            </defs>
                            <clipPath id="SVGID_98_">
                                <use xlink:href="#SVGID_97_"  style="overflow:visible;"/>
                            </clipPath>
                            <path class="st48" d="M25.6,612c-7.95,0-14.4-6.45-14.4-14.4V482.4c0-7.95,6.45-14.4,14.4-14.4h259.2
                                c7.95,0,14.4,6.45,14.4,14.4v115.2c0,7.95-6.45,14.4-14.4,14.4H25.6z"/>
                        </g>
                    </g>
                </g>
            </g>
        </g>
    </g>
</g>
<g>
    <defs>
        <rect id="SVGID_99_" x="312" y="468" width="289" height="144"/>
    </defs>
    <clipPath id="SVGID_100_">
        <use xlink:href="#SVGID_99_"  style="overflow:visible;"/>
    </clipPath>
    <g class="st49">
        <defs>
            <rect id="SVGID_101_" x="312" y="468" width="289" height="144"/>
        </defs>
        <clipPath id="SVGID_102_">
            <use xlink:href="#SVGID_101_"  style="overflow:visible;"/>
        </clipPath>
        <g class="st50">
            <defs>
                <rect id="SVGID_103_" x="312" y="468" width="289" height="144"/>
            </defs>
            <clipPath id="SVGID_104_">
                <use xlink:href="#SVGID_103_"  style="overflow:visible;"/>
            </clipPath>
            <g class="st51">
                <defs>
                    <path id="SVGID_105_" d="M327.15,468c-7.95,0-14.4,6.45-14.4,14.4v115.2c0,7.95,6.45,14.4,14.4,14.4h259.2
                        c7.95,0,14.4-6.45,14.4-14.4V482.4c0-7.95-6.45-14.4-14.4-14.4H327.15z"/>
                </defs>
                <clipPath id="SVGID_106_">
                    <use xlink:href="#SVGID_105_"  style="overflow:visible;"/>
                </clipPath>
                <g class="st52">
                    <defs>
                        <rect id="SVGID_107_" x="312" y="467" width="290" height="146"/>
                    </defs>
                    <clipPath id="SVGID_108_">
                        <use xlink:href="#SVGID_107_"  style="overflow:visible;"/>
                    </clipPath>
                    <g class="st53">
                        <defs>
                            <rect id="SVGID_109_" x="312" y="467" width="290" height="146"/>
                        </defs>
                        <clipPath id="SVGID_110_">
                            <use xlink:href="#SVGID_109_"  style="overflow:visible;"/>
                        </clipPath>
                        <g class="st54">
                            <defs>
                                <rect id="SVGID_111_" x="312" y="467" width="290" height="146"/>
                            </defs>
                            <clipPath id="SVGID_112_">
                                <use xlink:href="#SVGID_111_"  style="overflow:visible;"/>
                            </clipPath>
                            <path class="st55" d="M327.15,612c-7.95,0-14.4-6.45-14.4-14.4V482.4c0-7.95,6.45-14.4,14.4-14.4h259.2
                                c7.95,0,14.4,6.45,14.4,14.4v115.2c0,7.95-6.45,14.4-14.4,14.4H327.15z"/>
                        </g>
                    </g>
                </g>
            </g>
        </g>
    </g>
</g>
<g>
    <defs>
        <rect id="SVGID_113_" x="11" y="612" width="289" height="144"/>
    </defs>
    <clipPath id="SVGID_114_">
        <use xlink:href="#SVGID_113_"  style="overflow:visible;"/>
    </clipPath>
    <g class="st56">
        <defs>
            <rect id="SVGID_115_" x="11" y="612" width="289" height="144"/>
        </defs>
        <clipPath id="SVGID_116_">
            <use xlink:href="#SVGID_115_"  style="overflow:visible;"/>
        </clipPath>
        <g class="st57">
            <defs>
                <rect id="SVGID_117_" x="11" y="612" width="289" height="144"/>
            </defs>
            <clipPath id="SVGID_118_">
                <use xlink:href="#SVGID_117_"  style="overflow:visible;"/>
            </clipPath>
            <g class="st58">
                <defs>
                    <path id="SVGID_119_" d="M25.6,612c-7.95,0-14.4,6.45-14.4,14.4v115.2c0,7.95,6.45,14.4,14.4,14.4h259.2
                        c7.95,0,14.4-6.45,14.4-14.4V626.4c0-7.95-6.45-14.4-14.4-14.4H25.6z"/>
                </defs>
                <clipPath id="SVGID_120_">
                    <use xlink:href="#SVGID_119_"  style="overflow:visible;"/>
                </clipPath>
                <g class="st59">
                    <defs>
                        <rect id="SVGID_121_" x="10" y="611" width="290" height="146"/>
                    </defs>
                    <clipPath id="SVGID_122_">
                        <use xlink:href="#SVGID_121_"  style="overflow:visible;"/>
                    </clipPath>
                    <g class="st60">
                        <defs>
                            <rect id="SVGID_123_" x="10" y="611" width="290" height="146"/>
                        </defs>
                        <clipPath id="SVGID_124_">
                            <use xlink:href="#SVGID_123_"  style="overflow:visible;"/>
                        </clipPath>
                        <g class="st61">
                            <defs>
                                <rect id="SVGID_125_" x="10" y="611" width="290" height="146"/>
                            </defs>
                            <clipPath id="SVGID_126_">
                                <use xlink:href="#SVGID_125_"  style="overflow:visible;"/>
                            </clipPath>
                            <path class="st62" d="M25.6,756c-7.95,0-14.4-6.45-14.4-14.4V626.4c0-7.95,6.45-14.4,14.4-14.4h259.2
                                c7.95,0,14.4,6.45,14.4,14.4v115.2c0,7.95-6.45,14.4-14.4,14.4H25.6z"/>
                        </g>
                    </g>
                </g>
            </g>
        </g>
    </g>
</g>
<g>
    <defs>
        <rect id="SVGID_127_" x="312" y="612" width="289" height="144"/>
    </defs>
    <clipPath id="SVGID_128_">
        <use xlink:href="#SVGID_127_"  style="overflow:visible;"/>
    </clipPath>
    <g class="st63">
        <defs>
            <rect id="SVGID_129_" x="312" y="612" width="289" height="144"/>
        </defs>
        <clipPath id="SVGID_130_">
            <use xlink:href="#SVGID_129_"  style="overflow:visible;"/>
        </clipPath>
        <g class="st64">
            <defs>
                <rect id="SVGID_131_" x="312" y="612" width="289" height="144"/>
            </defs>
            <clipPath id="SVGID_132_">
                <use xlink:href="#SVGID_131_"  style="overflow:visible;"/>
            </clipPath>
            <g class="st65">
                <defs>
                    <path id="SVGID_133_" d="M327.15,612c-7.95,0-14.4,6.45-14.4,14.4v115.2c0,7.95,6.45,14.4,14.4,14.4h259.2
                        c7.95,0,14.4-6.45,14.4-14.4V626.4c0-7.95-6.45-14.4-14.4-14.4H327.15z"/>
                </defs>
                <clipPath id="SVGID_134_">
                    <use xlink:href="#SVGID_133_"  style="overflow:visible;"/>
                </clipPath>
                <g class="st66">
                    <defs>
                        <rect id="SVGID_135_" x="312" y="611" width="290" height="146"/>
                    </defs>
                    <clipPath id="SVGID_136_">
                        <use xlink:href="#SVGID_135_"  style="overflow:visible;"/>
                    </clipPath>
                    <g class="st67">
                        <defs>
                            <rect id="SVGID_137_" x="312" y="611" width="290" height="146"/>
                        </defs>
                        <clipPath id="SVGID_138_">
                            <use xlink:href="#SVGID_137_"  style="overflow:visible;"/>
                        </clipPath>
                        <g class="st68">
                            <defs>
                                <rect id="SVGID_139_" x="312" y="611" width="290" height="146"/>
                            </defs>
                            <clipPath id="SVGID_140_">
                                <use xlink:href="#SVGID_139_"  style="overflow:visible;"/>
                            </clipPath>
                            <path class="st69" d="M327.15,756c-7.95,0-14.4-6.45-14.4-14.4V626.4c0-7.95,6.45-14.4,14.4-14.4h259.2
                                c7.95,0,14.4,6.45,14.4,14.4v115.2c0,7.95-6.45,14.4-14.4,14.4H327.15z"/>
                        </g>
                    </g>
                </g>
            </g>
        </g>
    </g>
</g>
<g>
    <defs>
        <rect id="SVGID_141_" x="324.18" y="622.4" width="123" height="123"/>
    </defs>
    <clipPath id="SVGID_142_">
        <use xlink:href="#SVGID_141_"  style="overflow:visible;"/>
    </clipPath>
    <g class="st70">
        <defs>
            <rect id="SVGID_143_" x="323.37" y="622.2" width="124" height="124"/>
        </defs>
        <clipPath id="SVGID_144_">
            <use xlink:href="#SVGID_143_"  style="overflow:visible;"/>
        </clipPath>
        <g class="st71">
            <defs>
                <rect id="SVGID_145_" x="324.18" y="622.4" width="123" height="123"/>
            </defs>
            <clipPath id="SVGID_146_">
                <use xlink:href="#SVGID_145_"  style="overflow:visible;"/>
            </clipPath>
            <g class="st72">
                <defs>
                    <rect id="SVGID_147_" x="324.19" y="622.4" width="123" height="123"/>
                </defs>
                <clipPath id="SVGID_148_">
                    <use xlink:href="#SVGID_147_"  style="overflow:visible;"/>
                </clipPath>
                <g style="clip-path:url(#SVGID_148_);">
                    
                        <image style="overflow:visible;" width="164" height="164" xlink:href="`,`" transform="matrix(0.75 0 0 0.75 324.1863 622.3998)">
                    </image>
                </g>
            </g>
        </g>
    </g>
</g>
<g>
    <defs>
        <rect id="SVGID_149_" x="324.18" y="45.3" width="123" height="123"/>
    </defs>
    <clipPath id="SVGID_150_">
        <use xlink:href="#SVGID_149_"  style="overflow:visible;"/>
    </clipPath>
    <g class="st73">
        <defs>
            <rect id="SVGID_151_" x="323.66" y="45" width="124" height="124"/>
        </defs>
        <clipPath id="SVGID_152_">
            <use xlink:href="#SVGID_151_"  style="overflow:visible;"/>
        </clipPath>
        <g class="st74">
            <defs>
                <rect id="SVGID_153_" x="324.18" y="45.3" width="123" height="123"/>
            </defs>
            <clipPath id="SVGID_154_">
                <use xlink:href="#SVGID_153_"  style="overflow:visible;"/>
            </clipPath>
            <g class="st75">
                <defs>
                    <rect id="SVGID_155_" x="324.18" y="45.3" width="123" height="123"/>
                </defs>
                <clipPath id="SVGID_156_">
                    <use xlink:href="#SVGID_155_"  style="overflow:visible;"/>
                </clipPath>
                <g style="clip-path:url(#SVGID_156_);">
                    
                        <image style="overflow:visible;" width="164" height="164" xlink:href="`,`" transform="matrix(0.75 0 0 0.75 324.1837 45.2956)">
                    </image>
                </g>
            </g>
        </g>
    </g>
</g>
<g>
    <defs>
        <rect id="SVGID_157_" x="19.18" y="335.18" width="123" height="123"/>
    </defs>
    <clipPath id="SVGID_158_">
        <use xlink:href="#SVGID_157_"  style="overflow:visible;"/>
    </clipPath>
    <g class="st76">
        <defs>
            <rect id="SVGID_159_" x="18.82" y="334.41" width="124" height="124"/>
        </defs>
        <clipPath id="SVGID_160_">
            <use xlink:href="#SVGID_159_"  style="overflow:visible;"/>
        </clipPath>
        <g class="st77">
            <defs>
                <rect id="SVGID_161_" x="19.18" y="335.18" width="123" height="123"/>
            </defs>
            <clipPath id="SVGID_162_">
                <use xlink:href="#SVGID_161_"  style="overflow:visible;"/>
            </clipPath>
            <g class="st78">
                <defs>
                    <rect id="SVGID_163_" x="19.19" y="335.19" width="123" height="123"/>
                </defs>
                <clipPath id="SVGID_164_">
                    <use xlink:href="#SVGID_163_"  style="overflow:visible;"/>
                </clipPath>
                <g style="clip-path:url(#SVGID_164_);">
                    
                        <image style="overflow:visible;" width="164" height="164" xlink:href="`,`" transform="matrix(0.75 0 0 0.75 19.1856 335.1852)">
                    </image>
                </g>
            </g>
        </g>
    </g>
</g>
<g>
    <defs>
        <rect id="SVGID_165_" x="19.18" y="190.5" width="123" height="123"/>
    </defs>
    <clipPath id="SVGID_166_">
        <use xlink:href="#SVGID_165_"  style="overflow:visible;"/>
    </clipPath>
    <g class="st79">
        <defs>
            <rect id="SVGID_167_" x="18.71" y="189.77" width="124" height="124"/>
        </defs>
        <clipPath id="SVGID_168_">
            <use xlink:href="#SVGID_167_"  style="overflow:visible;"/>
        </clipPath>
        <g class="st80">
            <defs>
                <rect id="SVGID_169_" x="19.18" y="190.5" width="123" height="123"/>
            </defs>
            <clipPath id="SVGID_170_">
                <use xlink:href="#SVGID_169_"  style="overflow:visible;"/>
            </clipPath>
            <g class="st81">
                <defs>
                    <rect id="SVGID_171_" x="19.18" y="190.5" width="123" height="123"/>
                </defs>
                <clipPath id="SVGID_172_">
                    <use xlink:href="#SVGID_171_"  style="overflow:visible;"/>
                </clipPath>
                <g style="clip-path:url(#SVGID_172_);">
                    
                        <image style="overflow:visible;" width="164" height="164" xlink:href="`,`" transform="matrix(0.75 0 0 0.75 19.1837 190.501)">
                    </image>
                </g>
            </g>
        </g>
    </g>
</g>
<g>
    <defs>
        <rect id="SVGID_173_" x="19.18" y="622.5" width="123" height="123"/>
    </defs>
    <clipPath id="SVGID_174_">
        <use xlink:href="#SVGID_173_"  style="overflow:visible;"/>
    </clipPath>
    <g class="st82">
        <defs>
            <rect id="SVGID_175_" x="19" y="622.38" width="124" height="124"/>
        </defs>
        <clipPath id="SVGID_176_">
            <use xlink:href="#SVGID_175_"  style="overflow:visible;"/>
        </clipPath>
        <g class="st83">
            <defs>
                <rect id="SVGID_177_" x="19.18" y="622.5" width="123" height="123"/>
            </defs>
            <clipPath id="SVGID_178_">
                <use xlink:href="#SVGID_177_"  style="overflow:visible;"/>
            </clipPath>
            <g class="st84">
                <defs>
                    <rect id="SVGID_179_" x="19.18" y="622.5" width="123" height="123"/>
                </defs>
                <clipPath id="SVGID_180_">
                    <use xlink:href="#SVGID_179_"  style="overflow:visible;"/>
                </clipPath>
                <g style="clip-path:url(#SVGID_180_);">
                    
                        <image style="overflow:visible;" width="164" height="164" xlink:href="`,`" transform="matrix(0.75 0 0 0.75 19.1821 622.5006)">
                    </image>
                </g>
            </g>
        </g>
    </g>
</g>
<g>
    <defs>
        <rect id="SVGID_181_" x="324.18" y="190.5" width="123" height="123"/>
    </defs>
    <clipPath id="SVGID_182_">
        <use xlink:href="#SVGID_181_"  style="overflow:visible;"/>
    </clipPath>
    <g class="st85">
        <defs>
            <rect id="SVGID_183_" x="323.92" y="189.99" width="124" height="124"/>
        </defs>
        <clipPath id="SVGID_184_">
            <use xlink:href="#SVGID_183_"  style="overflow:visible;"/>
        </clipPath>
        <g class="st86">
            <defs>
                <rect id="SVGID_185_" x="324.18" y="190.5" width="123" height="123"/>
            </defs>
            <clipPath id="SVGID_186_">
                <use xlink:href="#SVGID_185_"  style="overflow:visible;"/>
            </clipPath>
            <g class="st87">
                <defs>
                    <rect id="SVGID_187_" x="324.18" y="190.5" width="123" height="123"/>
                </defs>
                <clipPath id="SVGID_188_">
                    <use xlink:href="#SVGID_187_"  style="overflow:visible;"/>
                </clipPath>
                <g style="clip-path:url(#SVGID_188_);">
                    
                        <image style="overflow:visible;" width="164" height="164" xlink:href="`,`" transform="matrix(0.75 0 0 0.75 324.1828 190.5001)">
                    </image>
                </g>
            </g>
        </g>
    </g>
</g>
<g>
    <defs>
        <rect id="SVGID_189_" x="19.18" y="473.2" width="123" height="123"/>
    </defs>
    <clipPath id="SVGID_190_">
        <use xlink:href="#SVGID_189_"  style="overflow:visible;"/>
    </clipPath>
    <g class="st88">
        <defs>
            <rect id="SVGID_191_" x="18.22" y="472.59" width="124" height="124"/>
        </defs>
        <clipPath id="SVGID_192_">
            <use xlink:href="#SVGID_191_"  style="overflow:visible;"/>
        </clipPath>
        <g class="st89">
            <defs>
                <rect id="SVGID_193_" x="19.18" y="473.2" width="123" height="123"/>
            </defs>
            <clipPath id="SVGID_194_">
                <use xlink:href="#SVGID_193_"  style="overflow:visible;"/>
            </clipPath>
            <g class="st90">
                <defs>
                    <rect id="SVGID_195_" x="19.18" y="473.2" width="123" height="123"/>
                </defs>
                <clipPath id="SVGID_196_">
                    <use xlink:href="#SVGID_195_"  style="overflow:visible;"/>
                </clipPath>
                <g style="clip-path:url(#SVGID_196_);">
                    
                        <image style="overflow:visible;" width="164" height="164" xlink:href="`,`" transform="matrix(0.75 0 0 0.75 19.1849 473.2033)">
                    </image>
                </g>
            </g>
        </g>
    </g>
</g>
<g>
    <defs>
        <rect id="SVGID_197_" x="19.18" y="45.3" width="123" height="123"/>
    </defs>
    <clipPath id="SVGID_198_">
        <use xlink:href="#SVGID_197_"  style="overflow:visible;"/>
    </clipPath>
    <g class="st91">
        <defs>
            <rect id="SVGID_199_" x="18.85" y="44.82" width="124" height="124"/>
        </defs>
        <clipPath id="SVGID_200_">
            <use xlink:href="#SVGID_199_"  style="overflow:visible;"/>
        </clipPath>
        <g class="st92">
            <defs>
                <rect id="SVGID_201_" x="19.18" y="45.3" width="123" height="123"/>
            </defs>
            <clipPath id="SVGID_202_">
                <use xlink:href="#SVGID_201_"  style="overflow:visible;"/>
            </clipPath>
            <g class="st93">
                <defs>
                    <rect id="SVGID_203_" x="19.18" y="45.3" width="123" height="123"/>
                </defs>
                <clipPath id="SVGID_204_">
                    <use xlink:href="#SVGID_203_"  style="overflow:visible;"/>
                </clipPath>
                <g style="clip-path:url(#SVGID_204_);">
                    
                        <image style="overflow:visible;" width="164" height="164" xlink:href="`,`" transform="matrix(0.75 0 0 0.75 19.1828 45.2991)">
                    </image>
                </g>
            </g>
        </g>
    </g>
</g>
<g>
    <defs>
        <rect id="SVGID_205_" x="324.18" y="478.5" width="123" height="123"/>
    </defs>
    <clipPath id="SVGID_206_">
        <use xlink:href="#SVGID_205_"  style="overflow:visible;"/>
    </clipPath>
    <g class="st94">
        <defs>
            <rect id="SVGID_207_" x="324" y="478.18" width="124" height="124"/>
        </defs>
        <clipPath id="SVGID_208_">
            <use xlink:href="#SVGID_207_"  style="overflow:visible;"/>
        </clipPath>
        <g class="st95">
            <defs>
                <rect id="SVGID_209_" x="324.18" y="478.5" width="123" height="123"/>
            </defs>
            <clipPath id="SVGID_210_">
                <use xlink:href="#SVGID_209_"  style="overflow:visible;"/>
            </clipPath>
            <g class="st96">
                <defs>
                    <rect id="SVGID_211_" x="324.18" y="478.5" width="123" height="123"/>
                </defs>
                <clipPath id="SVGID_212_">
                    <use xlink:href="#SVGID_211_"  style="overflow:visible;"/>
                </clipPath>
                <g style="clip-path:url(#SVGID_212_);">
                    
                        <image style="overflow:visible;" width="164" height="164" xlink:href="`,`" transform="matrix(0.75 0 0 0.75 324.1841 478.5015)">
                    </image>
                </g>
            </g>
        </g>
    </g>
</g>
<polygon class="st97" points="132,181 196,323 273,323 202.5,181 "/>
<polygon class="st97" points="132,324 196,466 273,466 202.5,324 "/>
<g>
    <defs>
        <rect id="SVGID_213_" x="324.18" y="334.5" width="123" height="123"/>
    </defs>
    <clipPath id="SVGID_214_">
        <use xlink:href="#SVGID_213_"  style="overflow:visible;"/>
    </clipPath>
    <g class="st98">
        <defs>
            <rect id="SVGID_215_" x="324" y="333.6" width="124" height="124"/>
        </defs>
        <clipPath id="SVGID_216_">
            <use xlink:href="#SVGID_215_"  style="overflow:visible;"/>
        </clipPath>
        <g class="st99">
            <defs>
                <rect id="SVGID_217_" x="324.18" y="334.5" width="123" height="123"/>
            </defs>
            <clipPath id="SVGID_218_">
                <use xlink:href="#SVGID_217_"  style="overflow:visible;"/>
            </clipPath>
            <g class="st100">
                <defs>
                    <rect id="SVGID_219_" x="324.18" y="334.5" width="123" height="123"/>
                </defs>
                <clipPath id="SVGID_220_">
                    <use xlink:href="#SVGID_219_"  style="overflow:visible;"/>
                </clipPath>
                <g style="clip-path:url(#SVGID_220_);">
                    
                        <image style="overflow:visible;" width="164" height="164" xlink:href="`,`" transform="matrix(0.75 0 0 0.75 324.1841 334.5008)">
                    </image>
                </g>
            </g>
        </g>
    </g>
</g>
<polygon class="st97" points="132,36 196,178 273,178 202.5,36 "/>
<rect x="142.18" y="45.3" class="st101" width="151.82" height="122.7"/>
<text transform="matrix(1 0 0 1 142.1841 60.9165)"><tspan x="0" y="0" class="st102 st103">If anything’s </tspan><tspan x="0" y="26.4" class="st102 st103">broken, dirty, or </tspan><tspan x="0" y="52.8" class="st102 st103">isn’t how it </tspan><tspan x="0" y="79.2" class="st102 st103">should be, scan </tspan><tspan x="0" y="105.6" class="st102 st103">me!</tspan></text>
<rect x="142.18" y="190.65" class="st101" width="151.82" height="122.7"/>
<text transform="matrix(1 0 0 1 142.1841 206.268)"><tspan x="0" y="0" class="st102 st103">If anything’s </tspan><tspan x="0" y="26.4" class="st102 st103">broken, dirty, or </tspan><tspan x="0" y="52.8" class="st102 st103">isn’t how it </tspan><tspan x="0" y="79.2" class="st102 st103">should be, scan </tspan><tspan x="0" y="105.6" class="st102 st103">me!</tspan></text>
<polygon class="st97" points="132,612 196,754 273,754 202.5,612 "/>
<polygon class="st97" points="132,467.5 196,609.5 273,609.5 202.5,467.5 "/>
<rect x="138.18" y="331.83" class="st101" width="151.82" height="122.7"/>
<text transform="matrix(1 0 0 1 138.1841 347.447)"><tspan x="0" y="0" class="st102 st103">If anything’s </tspan><tspan x="0" y="26.4" class="st102 st103">broken, dirty, or </tspan><tspan x="0" y="52.8" class="st102 st103">isn’t how it </tspan><tspan x="0" y="79.2" class="st102 st103">should be, scan </tspan><tspan x="0" y="105.6" class="st102 st103">me!</tspan></text>
<rect x="138.18" y="478.65" class="st101" width="151.82" height="122.7"/>
<text transform="matrix(1 0 0 1 138.1841 494.268)"><tspan x="0" y="0" class="st102 st103">If anything’s </tspan><tspan x="0" y="26.4" class="st102 st103">broken, dirty, or </tspan><tspan x="0" y="52.8" class="st102 st103">isn’t how it </tspan><tspan x="0" y="79.2" class="st102 st103">should be, scan </tspan><tspan x="0" y="105.6" class="st102 st103">me!</tspan></text>
<rect x="138.18" y="622.65" class="st101" width="151.82" height="122.7"/>
<text transform="matrix(1 0 0 1 138.1841 638.268)"><tspan x="0" y="0" class="st102 st103">If anything’s </tspan><tspan x="0" y="26.4" class="st102 st103">broken, dirty, or </tspan><tspan x="0" y="52.8" class="st102 st103">isn’t how it </tspan><tspan x="0" y="79.2" class="st102 st103">should be, scan </tspan><tspan x="0" y="105.6" class="st102 st103">me!</tspan></text>
<polygon class="st97" points="427,325.68 491,467.68 568,467.68 497.5,325.68 "/>
<polygon class="st97" points="427,37.68 491,179.68 568,179.68 497.5,37.68 "/>
<polygon class="st97" points="427,613.68 491,755.68 568,755.68 497.5,613.68 "/>
<polygon class="st97" points="427,468.34 491,610.34 568,610.34 497.5,468.34 "/>
<rect x="447.18" y="45.3" class="st101" width="151.82" height="122.7"/>
<text transform="matrix(1 0 0 1 447.1841 60.9165)"><tspan x="0" y="0" class="st102 st103">If anything’s </tspan><tspan x="0" y="26.4" class="st102 st103">broken, dirty, or </tspan><tspan x="0" y="52.8" class="st102 st103">isn’t how it </tspan><tspan x="0" y="79.2" class="st102 st103">should be, scan </tspan><tspan x="0" y="105.6" class="st102 st103">me!</tspan></text>
<polygon class="st97" points="427,180.3 491,322.3 568,322.3 497.5,180.3 "/>
<rect x="441.18" y="190.65" class="st101" width="151.82" height="122.7"/>
<text transform="matrix(1 0 0 1 441.1841 206.268)"><tspan x="0" y="0" class="st102 st103">If anything’s </tspan><tspan x="0" y="26.4" class="st102 st103">broken, dirty, or </tspan><tspan x="0" y="52.8" class="st102 st103">isn’t how it </tspan><tspan x="0" y="79.2" class="st102 st103">should be, scan </tspan><tspan x="0" y="105.6" class="st102 st103">me!</tspan></text>
<rect x="447.18" y="335.33" class="st101" width="151.82" height="122.7"/>
<text transform="matrix(1 0 0 1 447.1841 350.951)"><tspan x="0" y="0" class="st102 st103">If anything’s </tspan><tspan x="0" y="26.4" class="st102 st103">broken, dirty, or </tspan><tspan x="0" y="52.8" class="st102 st103">isn’t how it </tspan><tspan x="0" y="79.2" class="st102 st103">should be, scan </tspan><tspan x="0" y="105.6" class="st102 st103">me!</tspan></text>
<rect x="441.18" y="473.35" class="st101" width="151.82" height="122.7"/>
<text transform="matrix(1 0 0 1 441.1841 488.973)"><tspan x="0" y="0" class="st102 st103">If anything’s </tspan><tspan x="0" y="26.4" class="st102 st103">broken, dirty, or </tspan><tspan x="0" y="52.8" class="st102 st103">isn’t how it </tspan><tspan x="0" y="79.2" class="st102 st103">should be, scan </tspan><tspan x="0" y="105.6" class="st102 st103">me!</tspan></text>
<rect x="441.18" y="622.8" class="st101" width="151.82" height="122.7"/>
<text transform="matrix(1 0 0 1 441.1841 638.4165)"><tspan x="0" y="0" class="st102 st103">If anything’s </tspan><tspan x="0" y="26.4" class="st102 st103">broken, dirty, or </tspan><tspan x="0" y="52.8" class="st102 st103">isn’t how it </tspan><tspan x="0" y="79.2" class="st102 st103">should be, scan </tspan><tspan x="0" y="105.6" class="st102 st103">me!</tspan></text>
<rect x="30.46" y="305.07" class="st101" width="100.44" height="14.35"/>
<text transform="matrix(1.0021 0 0 1 30.4629 315.8206)"><tspan x="0" y="0" class="st104 st105 st106">C</tspan><tspan x="9.14" y="0" class="st107 st105 st106">lean</tspan><tspan x="34.57" y="0" class="st108 st105 st106">C</tspan><tspan x="43.71" y="0" class="st109 st105 st106">onnect</tspan></text>
<rect x="115.32" y="311.49" class="st109" width="3.45" height="3.35"/>
<rect x="122.22" y="311.49" class="st109" width="3.45" height="3.35"/>
<rect x="118.77" y="308.14" class="st110" width="3.45" height="3.35"/>
<rect x="125.68" y="308.14" class="st110" width="3.45" height="3.35"/>
<rect x="31" y="447.36" class="st101" width="100.44" height="14.35"/>
<text transform="matrix(1.0021 0 0 1 31.0025 458.1122)"><tspan x="0" y="0" class="st104 st105 st106">C</tspan><tspan x="9.14" y="0" class="st107 st105 st106">lean</tspan><tspan x="34.57" y="0" class="st108 st105 st106">C</tspan><tspan x="43.71" y="0" class="st109 st105 st106">onnect</tspan></text>
<rect x="115.86" y="453.79" class="st109" width="3.45" height="3.35"/>
<rect x="122.76" y="453.79" class="st109" width="3.45" height="3.35"/>
<rect x="119.31" y="450.43" class="st110" width="3.45" height="3.35"/>
<rect x="126.22" y="450.43" class="st110" width="3.45" height="3.35"/>
<rect x="30.46" y="587.01" class="st101" width="100.44" height="14.35"/>
<text transform="matrix(1.0021 0 0 1 30.4629 597.7601)"><tspan x="0" y="0" class="st104 st105 st106">C</tspan><tspan x="9.14" y="0" class="st107 st105 st106">lean</tspan><tspan x="34.57" y="0" class="st108 st105 st106">C</tspan><tspan x="43.71" y="0" class="st109 st105 st106">onnect</tspan></text>
<rect x="115.32" y="593.43" class="st109" width="3.45" height="3.35"/>
<rect x="122.22" y="593.43" class="st109" width="3.45" height="3.35"/>
<rect x="118.77" y="590.08" class="st110" width="3.45" height="3.35"/>
<rect x="125.68" y="590.08" class="st110" width="3.45" height="3.35"/>
<rect x="31" y="734.57" class="st101" width="100.44" height="14.35"/>
<text transform="matrix(1.0021 0 0 1 31.0025 745.3264)"><tspan x="0" y="0" class="st104 st105 st106">C</tspan><tspan x="9.14" y="0" class="st107 st105 st106">lean</tspan><tspan x="34.57" y="0" class="st108 st105 st106">C</tspan><tspan x="43.71" y="0" class="st109 st105 st106">onnect</tspan></text>
<rect x="115.86" y="741" class="st109" width="3.45" height="3.35"/>
<rect x="122.76" y="741" class="st109" width="3.45" height="3.35"/>
<rect x="119.31" y="737.65" class="st110" width="3.45" height="3.35"/>
<rect x="126.22" y="737.65" class="st110" width="3.45" height="3.35"/>
<rect x="335.46" y="733.83" class="st101" width="100.44" height="14.35"/>
<text transform="matrix(1.0021 0 0 1 335.4629 744.5811)"><tspan x="0" y="0" class="st104 st105 st106">C</tspan><tspan x="9.14" y="0" class="st107 st105 st106">lean</tspan><tspan x="34.57" y="0" class="st108 st105 st106">C</tspan><tspan x="43.71" y="0" class="st109 st105 st106">onnect</tspan></text>
<rect x="420.32" y="740.25" class="st109" width="3.45" height="3.35"/>
<rect x="427.22" y="740.25" class="st109" width="3.45" height="3.35"/>
<rect x="423.77" y="736.9" class="st110" width="3.45" height="3.35"/>
<rect x="430.68" y="736.9" class="st110" width="3.45" height="3.35"/>
<rect x="335.46" y="590.08" class="st101" width="100.44" height="14.35"/>
<text transform="matrix(1.0021 0 0 1 335.4629 600.8343)"><tspan x="0" y="0" class="st104 st105 st106">C</tspan><tspan x="9.14" y="0" class="st107 st105 st106">lean</tspan><tspan x="34.57" y="0" class="st108 st105 st106">C</tspan><tspan x="43.71" y="0" class="st109 st105 st106">onnect</tspan></text>
<rect x="420.32" y="596.51" class="st109" width="3.45" height="3.35"/>
<rect x="427.22" y="596.51" class="st109" width="3.45" height="3.35"/>
<rect x="423.77" y="593.15" class="st110" width="3.45" height="3.35"/>
<rect x="430.68" y="593.15" class="st110" width="3.45" height="3.35"/>
<rect x="333.68" y="448.29" class="st101" width="100.44" height="14.35"/>
<text transform="matrix(1.0021 0 0 1 333.6839 459.0437)"><tspan x="0" y="0" class="st104 st105 st106">C</tspan><tspan x="9.14" y="0" class="st107 st105 st106">lean</tspan><tspan x="34.57" y="0" class="st108 st105 st106">C</tspan><tspan x="43.71" y="0" class="st109 st105 st106">onnect</tspan></text>
<rect x="418.54" y="454.72" class="st109" width="3.45" height="3.35"/>
<rect x="425.44" y="454.72" class="st109" width="3.45" height="3.35"/>
<rect x="421.99" y="451.36" class="st110" width="3.45" height="3.35"/>
<rect x="428.9" y="451.36" class="st110" width="3.45" height="3.35"/>
<rect x="335.46" y="157.96" class="st101" width="100.44" height="14.35"/>
<text transform="matrix(1.0021 0 0 1 335.4629 168.7145)"><tspan x="0" y="0" class="st104 st105 st106">C</tspan><tspan x="9.14" y="0" class="st107 st105 st106">lean</tspan><tspan x="34.57" y="0" class="st108 st105 st106">C</tspan><tspan x="43.71" y="0" class="st109 st105 st106">onnect</tspan></text>
<rect x="420.32" y="164.39" class="st109" width="3.45" height="3.35"/>
<rect x="427.22" y="164.39" class="st109" width="3.45" height="3.35"/>
<rect x="423.77" y="161.03" class="st110" width="3.45" height="3.35"/>
<rect x="430.68" y="161.03" class="st110" width="3.45" height="3.35"/>
<rect x="335.46" y="302.64" class="st101" width="100.44" height="14.35"/>
<text transform="matrix(1.0021 0 0 1 335.4629 313.3986)"><tspan x="0" y="0" class="st104 st105 st106">C</tspan><tspan x="9.14" y="0" class="st107 st105 st106">lean</tspan><tspan x="34.57" y="0" class="st108 st105 st106">C</tspan><tspan x="43.71" y="0" class="st109 st105 st106">onnect</tspan></text>
<rect x="420.32" y="309.07" class="st109" width="3.45" height="3.35"/>
<rect x="427.22" y="309.07" class="st109" width="3.45" height="3.35"/>
<rect x="423.77" y="305.72" class="st110" width="3.45" height="3.35"/>
<rect x="430.68" y="305.72" class="st110" width="3.45" height="3.35"/>
<rect x="30.46" y="157.96" class="st101" width="100.44" height="14.35"/>
<text transform="matrix(1.0021 0 0 1 30.4629 168.7145)"><tspan x="0" y="0" class="st104 st105 st106">C</tspan><tspan x="9.14" y="0" class="st107 st105 st106">lean</tspan><tspan x="34.57" y="0" class="st108 st105 st106">C</tspan><tspan x="43.71" y="0" class="st109 st105 st106">onnect</tspan></text>
<rect x="115.32" y="164.39" class="st109" width="3.45" height="3.35"/>
<rect x="122.22" y="164.39" class="st109" width="3.45" height="3.35"/>
<rect x="118.77" y="161.03" class="st110" width="3.45" height="3.35"/>
<rect x="125.68" y="161.03" class="st110" width="3.45" height="3.35"/>
</svg>`];
const tl = [{
            tagid: '9e87cfe0-e517-11e9-ad2d-59b6f467ed1e',
            name: 'tag z',
            comments: [],
            __v: 0
        },
        {
            tagid: '6c995810-e95d-11e9-8715-8fd31126566e',
            name: 'tag a',
            comments: [],
            __v: 0
        },
        {
            tagid: '78952c80-f41a-11e9-989f-11796a1aca21',
            name: 'tag b',
            comments: [],
            __v: 0
        },
        {
            tagid: '78952c80-f41a-11e9-989f-11796a1aca21',
            name: 'tag c',
            comments: [],
            __v: 0
        },
        {
            tagid: '78952c80-f41a-11e9-989f-11796a1aca21',
            name: 'tag d',
            comments: [],
            __v: 0
        },
        {
            tagid: '78952c80-f41a-11e9-989f-11796a1aca21',
            name: 'tag e',
            comments: [],
            __v: 0
        },
        {
            tagid: '78952c80-f41a-11e9-989f-11796a1aca21',
            name: 'tag f',
            comments: [],
            __v: 0
        },
        {
            tagid: '78952c80-f41a-11e9-989f-11796a1aca21',
            name: 'tag g',
            comments: [],
            __v: 0
        },
        {
            tagid: '9e90che0-e517-11e9-ad2d-55g5h577jl1e',
            name: 'tag z',
            comments: [],
            __v: 0
        },
        {
            tagid: '6c993810-e35d-13e9-8215-3fd35126576e',
            name: 'tag a',
            comments: [],
            __v: 0
        }
    ];
var linkList=[];
const doc = new PDFDocument(docsettings);
doc.pipe(fs.createWriteStream('../temp/' + fn + '.pdf'));
var pgsw = 0;
(async () => {
    for (let i = 0; i =< tl.length; i++) {
        if(i==tl.length){
            for(var i = 0;i<linkList.length;i+=10){
                doc.addPage(docsettings);//add fallback measures below VVVVV
                doc.path(dpath[0]+(linkList[0]||fallback)+dpath[1]+(linkList[1]||fallback)+dpath[2]+(linkList[2]||fallback)+dpath[3]+(linkList[3]||fallback)+dpath[4]+(linkList[4]||fallback)+dpath[5]+(linkList[5]||fallback)+dpath[6]+(linkList[6]||fallback)+dpath[7]+(linkList[7]||fallback)+dpath[8]+(linkList[8]||fallback)+dpath[9]+(linkList[9]||fallback)+dpath[10]);
            }
        }else{
        QRCode.toDataURL("http://website.com/tag/" + tl[i].tagid, function(error, url) {
            if (error) console.error(error);
            linkList.push(url);

            // if (i == 7) {
            //     pgsw = 285.7;
            // }
            // doc.path(dpath).lineWidth(3).fillAndStroke("grey", "#0f0f0f")
            // .text(gr[Math.ceil(Math.random() * (gr.length - 1))], pgsw, 50 + i * 108, {
            //         width: 333.75,
            //         align: 'right'
            //     }).fill("#FFFFFF").text(tl[i].name, 103 + pgsw, 200 + i * 108, {
            //         width: 173,
            //         align: 'right'
            //     }).fillOpacity(1).fill("#FFFFFF")
            //     .image(url, pgsw, i * 108, { fit: [108, 108], });
            // if (i == tl.length - 1) doc.end();
        });}
    }
    //label spec: https://uk.onlinelabels.com/templates/eu30011-template-pdf.html
    //https://www.npmjs.com/package/pdfkit
});
