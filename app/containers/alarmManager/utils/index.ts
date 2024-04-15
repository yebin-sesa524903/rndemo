import Colors from "../../../utils/const/Colors";
import moment from "moment/moment";
import {localStr} from "../../../utils/Localizations/localization";


export enum AlarmType {
    yw = 2,///业务报警
    tx = 1///通讯报警
}

export const configLevel = (level: number, alarmType: number) => {
    let color = ''
    let levelText = '';
    switch (level) {
        case 3:
            ///高
            color = Colors.seErrorNormal;
            levelText = localStr('lang_alarm_level_h');
            break;
        case 2:
            ///中
            color = Colors.seWarningNormal;
            levelText = localStr('lang_alarm_level_m');
            break;
        case 1:
            ///低
            color = Colors.seInfoNormal;
            levelText = localStr('lang_alarm_level_l');
            break;
    }
    if (alarmType === 2) {
        color = Colors.seTextDisabled;
    }
    return {color, levelText};
}


/**
 * 时间戳转换  xx天/xx小时/xx分钟/
 * @param alarmTime 时间戳 秒
 * @param resetTime 时间戳 秒
 */
export function formatAlarmTime(alarmTime: number, resetTime?: number) {
    let diff = moment().diff(moment(alarmTime * 1000));
    if (resetTime){
        diff = moment(resetTime * 1000).diff(moment(alarmTime * 1000));
    }
    // let duration = moment.duration(diff);
    // let humanize = duration.humanize();
    // if (humanize.indexOf('days') > -1){
    //     humanize = humanize.replace('days', '天');
    // }else if(humanize.indexOf('hours') > -1){
    //     humanize = humanize.replace('hours', '小时');
    // }else if(humanize.indexOf('minutes') > -1){
    //     humanize = humanize.replace('minutes', '分钟');
    // }else if(humanize.indexOf('seconds') > -1){
    //     humanize = humanize.replace('seconds', '秒');
    // }
    // return humanize;


    let parts = [];
    const duration = moment.duration(diff);

    if (!duration || duration.toISOString() === "P0D") return;

    if (duration.years() >= 1) {
        const years = Math.floor(duration.years());
        parts.push(years + localStr('lang_alarm_time_format_year'));
    }

    if (duration.months() >= 1) {
        const months = Math.floor(duration.months());
        parts.push(months + localStr('lang_alarm_time_format_month'));
    }

    if (duration.days() >= 1) {
        const days = Math.floor(duration.days());
        parts.push(days + localStr('lang_alarm_time_format_day'));
    }

    if (duration.hours() >= 1) {
        const hours = Math.floor(duration.hours());
        parts.push(hours + localStr('lang_alarm_time_format_hour'));
    }

    if (duration.minutes() >= 1) {
        const minutes = Math.floor(duration.minutes());
        parts.push(minutes + localStr('lang_alarm_time_format_minute'));
    }

    if (duration.seconds() >= 1) {
        const seconds = Math.floor(duration.seconds());
        parts.push(seconds + localStr('lang_alarm_time_format_second'));
    }

    return parts.join("");
}
