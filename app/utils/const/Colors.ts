import {Appearance} from "react-native";
import ModeDark from "../../styles/ModeDark";
import ModeLight from "../../styles/ModeLight";
export type Mode = 'light' | 'dark'

export enum AppearanceMode {
    light,
    dark
}

let Colors = {
    /**
     * 主题色
     */
    theme: '#3dcd58',
    themes: {
        normal: '#10357E',
        hover: '#5871A4',
        disable: '#B7C2D8',
        listSelect: '#EDF4FF',
        background: '#F6F8FD',
    },
    red: {
        primary: '#EB4741',
        sub: '#EF6B67',
        light: '',
    },
    blue: {
        primary: '#3491FA',
        sub: '#4D89DE',
        light: '',
    },
    green: {
        primary: '#3DCD58',
        sub: '#19C1A2',
        light: '#D7FAD9',
    },
    yellow: {
        primary: '#F78500',
        sub: '#FD7537',
        light: '',
    },
    text: {
        primary: '#333',
        sub: '#666',
        light: '#999',
        red: 'red',
        blue: 'blue',
        green: 'green',
        white: 'white',
        gray: 'gray',
        orange: 'orange',
        iconFill: '#3dcd58',
        suffix: '#888',
        toolbar_action_icon_disable: 'rgba(0, 0, 0, .12)',
        toolbar_action_text_disable: '#33333380',
        toolbar_border_color: '#e6e6e6',
        toolbar_tintColor: '#fff',
        toolbar_tintColor_white: '#fff',//android
    },
    gray: {
        primary: '#e4eaf3',
        sub: '#f5f5f5',
        light: '#f0f0f0',
    },
    background: {
        primary: '#f7f7f7',
        sub: '#f3f3f3',
        light: '#efefef',
        fill: '#f8f8f8',
        white: 'white',
        red: 'red',
        divider: '#f0f0f0',
        click: 'rgba(61,205,88,0.6)',//表示使用这个颜色组件都是可以点击的，不是通常意义的按钮
    },
    border: '#ebf1fc',
    border2: '#ddd',
    border3: '#BBBCC2',
    border4: '#C9D5FA',
    ///禁用色
    disable: 'rgba(0, 0, 0, 0.45)',
    white: '#fff',
    black: '#000',
    warningBg:'#fff',
    workbench_lg_start: '#3dcd5899',
    workbench_lg_end: 'rgba(61,205,88,0.25)',
    /**
     * 透明色
     */
    transparent: 'transparent',

    //设备列表状态颜色
    //正常
    device_status_1_text_color: '#52C41A',
    device_status_1_bg_color: '#F0FFF0',

    device_status_2_text_color: '#FA8C16',
    device_status_2_bg_color: '#FFF7E6',

    device_status_3_text_color: '#1890FF',
    device_status_3_bg_color: '#E6F7FF',

    device_status_4_text_color: '#FF4D4D',
    device_status_4_bg_color: '#f9898988',

    device_status_5_text_color: '#00000088',
    device_status_5_bg_color: '#FAFAFA',

    alarmHigh: '#F53F3F',
    alarmMiddle: '#FAAD14',
    alarmLow: '#3491FA',
    alarmRemove: '#BFBFBF',

    "sePrimaryColor": "#3DCD58",
    "sePrimaryColor1": "#f0fff0",
    "sePrimaryColor2": "#f0fff0",
    "sePrimaryColor3": "#bdf2c1",
    "sePrimaryColor4": "#8ee698",
    "sePrimaryColor5": "#64d975",
    "sePrimaryColor6": "#3DCD58",
    "sePrimaryColor7": "#29a644",
    "sePrimaryColor8": "#198033",
    "sePrimaryColor9": "#0d5923",
    "sePrimaryColor10": "#073315",
    "seMagenta": "#eb2f96",
    "sePink": "#eb2f96",
    "seRed": "#f5222d",
    "seVolcano": "#fa541c",
    "seOrange": "#fa8c16",
    "seYellow": "#fadb14",
    "seGold": "#faad14",
    "seCyan": "#13c2c2",
    "seLime": "#a0d911",
    "seGreen": "#52c41a",
    "seBlue": "#1890ff",
    "seGeekblue": "#597EF7",
    "sePurple": "#9254DE",
    "seSuccessColor": "#3DCD58",
    "seWarningColor": "#FF7D00",
    "seErrorColor": "#F53F3F",
    "seDisabledColor": "#BFBFBF",
    "seDisabledBg": "#F5F5F5",
    "seLinkColor": "#3DCD58",
    "seHoverColor": "#BDF2C1",
    "seHoverBg": "#F0FFF0",
    "seColor": "#595959",
    "seColorLg": "#1F1F1F",
    "seColorSm": "#8C8C8C",
    "seColorXs": "#BFBFBF",
    "seColorInverse": "#FFFFFF",
    "seBgColor": "#F4F6F8",
    "seContentBg": "#FFFFFF",
    "seBorderColor": "#D9D9D9",
    "seHeaderColor": "#1F1F1F",
    "seHeaderBg": "#FFFFFF",
    "seShadowColor": "rgba(0, 0, 0, 0.1)",
    "seBrandBg": "#f0fff0",
    "seBrandBorder": "#bdf2c1",
    "seBrandHoverd": "#64d975",
    "seBrandActive": "#29a644",
    "seBrandNomarl": "#3DCD58",
    "seBgLayout": "#F4F6F8",
    "seBgContainer": "#FFFFFF",
    "seBgContainerSecondary": "#FAFAFA",
    "seBgElevated": "#FFFFFF",
    "seBgSpotlight": "rgba(0, 0, 0, 0.75)",
    "seTextTitle": "#1F1F1F",
    "seTextPrimary": "#595959",
    "seTextSecondary": "#8C8C8C",
    "seTextDisabled": "#BFBFBF",
    "seTextInverse": "#FFFFFF",
    "seFill3": "#F5F5F5",
    "seFill4": "#FAFAFA",
    "seBorderBase": "#D9D9D9",
    "seBorderSplit": "#F0F0F0",
    "seInfoNormal": "#3491FA",
    "seInfoBorder": "#9FD4FD",
    "seInfoBg": "#E8F7FF",
    "seSuccessNormal": "#3DCD58",
    "seSuccessBorder": "#bdf2c1",
    "seSuccessBg": "#f0fff0",
    "seWarningNormal": "#FF7D00",
    "seWarningBorder": "#FFCF8B",
    "seWarningBg": "#FFF7E8",
    "seErrorNormal": "#F53F3F",
    "seErrorBorder": "#FBACA3",
    "seErrorBg": "#FFECE8",
    "seOthersGreenHeavy": "#237804",
    "seOthersGreen": "#52c41a",
    "seOthersGreenLight": "#b7eb8f",
    "seOthersGreenBg": "#f6ffed",
    "seOthersGold": "#faad14",
    "seOthersGoldLight": "#ffe58f",
    "seOthersGoldBg": "#fffbe6",
    "seOthersRed": "#f5222d",
    "seOthersRedLight": "#ffa39e",
    "seOthersRedBg": "#fff1f0",
    "seOthersBlue": "#1890ff",
    "seOthersBlueLight": "#91d5ff",
    "seOthersBlueBg": "#e6f7ff",
    "seOthersMagenta": "#eb2f96",
    "seOthersMagentaLight": "#ffadd2",
    "seOthersMagentaBg": "#fff0f6",
    "seOthersViolet": "#5A3FFF",
    "seOthersVioletLight": "#cabaff",
    "seOthersVioletBg": "#f4f0ff",
    "seOthersPurple": "#9254DE",
    "seOthersPurpleLight": "#efdbff",
    "seOthersPurpleBg": "#f9f0ff",
    "seOthersCyan": "#13c2c2",
    "seOthersCyanLight": "#87e8de",
    "seOthersCyanBg": "#e6fffb",
    "seOthersStoneblue": "#65789B",
    "seOthersStoneblueLight": "#b6bbc2",
    "seOthersStoneblueBg": "#ced5db",
    "seOthersGeekblue": "#597EF7",
    "seOthersGeekblueLight": "#d6e4ff",
    "seOthersGeekblueBg": "#f0f6ff",
}

let darkColors = ModeDark;
let lightColors = ModeLight;

let __currentTheme = AppearanceMode.light;

export const isDarkMode = ()=>{
    return Appearance.getColorScheme() === 'dark';
}

export function changeTheme() {
    let mode = Appearance.getColorScheme();
    console.log(mode);
    switch (mode) {
        case 'light':
            __currentTheme = AppearanceMode.light;
            Colors = Object.assign(Colors, lightColors);
            break;
        case 'dark':
            __currentTheme = AppearanceMode.dark;
            Colors = Object.assign(Colors, darkColors);
            break;
    }
    console.log(Colors);
}


// @ts-ignore
global.amStyleProxy = function (cb: Function) {
    let _cache: any = {theme: null, styles: null}
    let handle = {
        get: function (obj: any, props: any) {
            if (_cache.theme !== __currentTheme) {
                _cache.theme = __currentTheme
                _cache.styles = cb();
            }
            return _cache.styles[props];
        }
    }
    return new Proxy(_cache, handle);
}

export default Colors;
