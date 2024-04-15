'use strict'
import React,{Component,} from 'react';


import {Text,} from 'react-native';
import PropTypes from 'prop-types';



export default class Icon extends Component {
  constructor(props){
    super(props);
  }
  render () {
    var {style,size,type,color,font} = this.props;

    var styles = [style,{backgroundColor:'transparent',fontFamily:font || 'fontcustom',fontSize:size,color}];

    switch (type) {
      case 'moon_profile_select':
        return (
            <Text style={styles}>&#xe923;</Text>
        );
      case 'moon_profile':
        return (
            <Text style={styles}>&#xe924;</Text>
        );

      case 'moon_workboard_select':
        return (
            <Text style={styles}>&#xe93f;</Text>
        );
      case 'moon_workboard':
        return (
            <Text style={styles}>&#xe940;</Text>
        );

      case 'moon_workbranch_select':
        return (
            <Text style={styles}>&#xe941;</Text>
        );
      case 'moon_workbranch':
        return (
            <Text style={styles}>&#xe942;</Text>
        );

        //icon-add
      case 'moon_icon-add':
        return (
            <Text style={styles}>&#xe904;</Text>
        );

      case 'moon_icon-arrow_down':
        return (
            <Text style={styles}>&#xe905;</Text>
        );
      case 'moon_icon-arrow_right':
        return (
            <Text style={styles}>&#xe906;</Text>
        );
      case 'moon_icon-arrow_up':
        return (
            <Text style={styles}>&#xe907;</Text>
        );
        //icon-scan
      case 'moon_icon-scan':
        return (
            <Text style={styles}>&#xe935;</Text>
        );
        //icon-checkbox_nomal
      case 'moon_icon-checkbox_nomal':
        return (
            <Text style={styles}>&#xe90e;</Text>
        );
      case 'moon_icon-checkbox_select':
        return (
            <Text style={styles}>&#xe90f;</Text>
        );
      case 'moon_icon-deviceFile_fill':
        return (
            <Text style={styles}>&#xe914;</Text>
        );
      case 'moon_icon-message_fill':
        return (
            <Text style={styles}>&#xe921;</Text>
        );
        //icon-spareParts_fill
      case 'moon_icon-spareParts_fill':
        return (
            <Text style={styles}>&#xe931;</Text>
        );
      case 'moon_icon-file_fill':
        return (
            <Text style={styles}>&#xe916;</Text>
        );
        //icon-change_fill
      case 'moon_icon-change_fill':
        return (
            <Text style={styles}>&#xe90d;</Text>
        );
        //icon-act_fill
      case 'moon_icon-act_fill':
        return (
            <Text style={styles}>&#xe903;</Text>
        );
//icon-standBy_fill
      case 'moon_icon-standBy_fill':
        return (
            <Text style={styles}>&#xe938;</Text>
        );
        //icon-range_fill
      case 'moon_icon-range_fill':
        return (
            <Text style={styles}>&#xe925;</Text>
        );
        //icon-summary_fill
      case 'moon_icon-summary_fill':
        return (
            <Text style={styles}>&#xe939;</Text>
        );
        //icon-inspection_fill
      case 'moon_icon-inspection_fill':
        return (
            <Text style={styles}>&#xe918;</Text>
        );
        //icon-maintain_fill
      case 'moon_icon-maintain_fill':
        return (
            <Text style={styles}>&#xe91d;</Text>
        );
        //icon-warning_fill
      case 'moon_icon-warning_fill':
        return (
            <Text style={styles}>&#xe93e;</Text>
        );
        //icon-runtime_fill
      case 'moon_icon-runtime_fill':
        return (
            <Text style={styles}>&#xe934;</Text>
        );
        //icon-picture_fill
      case 'moon_icon-picture_fill':
        return (
            <Text style={styles}>&#xe922;</Text>
        );
        //icon-asset_fill
      case 'moon_icon-asset_fill':
        return (
            <Text style={styles}>&#xe908;</Text>
        );
        //icon-bottle_wb
      case 'moon_icon-bottle_wb':
        return (
            <Text style={styles}>&#xe909;</Text>
        );
        //icon-acidDrum_wb
      case 'moon_icon-acidDrum_wb':
        return (
            <Text style={styles}>&#xe900;</Text>
        );
        //icon-inspection_wb
      case 'moon_icon-inspection_wb':
        return (
            <Text style={styles}>&#xe919;</Text>
        );
        //icon-maintain_wb
      case 'moon_icon-maintain_wb':
        return (
            <Text style={styles}>&#xe91e;</Text>
        );
        //icon-repair_wb
      case 'moon_icon-repair_wb':
        return (
            <Text style={styles}>&#xe926;</Text>
        );
        //icon-warning_wb
      case 'moon_icon-warning_wb':
        return (
            <Text style={styles}>&#xe93b;</Text>
        );
        //icon-consumableChange_wb
      case 'moon_icon-consumableChange_wb':
        return (
            <Text style={styles}>&#xe911;</Text>
        );
        //icon-replacementRetrieval_wb
      case 'moon_icon-replacementRetrieval_wb':
        return (
            <Text style={styles}>&#xe92e;</Text>
        );
        //icon-replacementCheck_wb
      case 'moon_icon-replacementCheck_wb':
        return (
            <Text style={styles}>&#xe92b;</Text>
        );

      case 'moon_icon-device-list':
        return (
            <Text style={styles}>&#xe943;</Text>
        );
      case 'moon_icon-default-image':
        return (
            <Text style={styles}>&#xe950;</Text>
        );

      case 'moon_icon-file-txt':
        return (
            <Text style={styles}>&#xe954;</Text>
        );

      case 'moon_icon-file-ppt':
        return (
            <Text style={styles}>&#xe951;</Text>
        );

      case 'moon_icon-file-pdf':
        return (
            <Text style={styles}>&#xe94d;</Text>
        );

      case 'moon_icon-file-doc':
        return (
            <Text style={styles}>&#xe947;</Text>
        );
      case 'moon_icon-file-xls':
        return (
            <Text style={styles}>&#xe94a;</Text>
        );

      case 'ticket_notstart':
        return (
          <Text style={styles}>&#xf170;</Text>
        );
      case 'ticket_processing':
        return (
          <Text style={styles}>&#xf171;</Text>
        );
      case 'ticket_finished':
        return (
          <Text style={styles}>&#xf16f;</Text>
        );
      case 'arrow_right':
        return (
          <Text style={styles}>&#xf104;</Text>
        );
      case 'arrow_location':
        return (
          <Text style={styles}>&#xf11f;</Text>
        );
      case 'icon_login_pass':
        return (
          <Text style={styles}>&#xf201;</Text>
        );
      case 'icon_write_log':
        return (
          <Text style={styles}>&#xf208;</Text>
        );
      case 'icon_device':
        return (
          <Text style={styles}>&#xf113;</Text>
        );
      case 'icon_device_box':
        return (
          <Text style={styles}>&#xf114;</Text>
        );
      case 'icon_panel':
        return (
          <Text style={styles}>&#xf126;</Text>
        );
      case 'icon_panel_box':
        return (
          <Text style={styles}>&#xf127;</Text>
        );
      case 'icon_building':
        return (
          <Text style={styles}>&#xf10a;</Text>
        );
      case 'icon_room':
        return (
          <Text style={styles}>&#xf12b;</Text>
        );
      case 'icon_power_dis_box':
        return (
          <Text style={styles}>&#xf287;</Text>
        );
      case 'icon_power_dis_box_online'://带尾巴
        return (
          <Text style={styles}>&#xf288;</Text>
        );
      case 'icon_floor'://带尾巴
        return (
          <Text style={styles}>&#xf289;</Text>
        );
      case 'photo':
        return (
          <Text style={styles}>&#xf128;</Text>
        );
      case 'camera':
        return (
          <Text style={styles}>&#xf265;</Text>
        );
      case 'icon_scan':
        return (
          <Text style={styles}>&#xf13d;</Text>
        );
      case 'icon_bind':
        return (
          <Text style={styles}>&#xf198;</Text>
        );
      case 'icon_add':
        return (
          <Text style={styles}>&#xf100;</Text>
        );
      case 'icon_check':
        return (
          <Text style={styles}>&#xf161;</Text>
        );
      case 'icon_document':
        return (
          <Text style={styles}>&#xf16e;</Text>
        );
      case 'icon_select':
        return (
          <Text style={styles}>&#xf16a;</Text>
        );
      case 'icon_unselect':
        return (
          <Text style={styles}>&#xf10d;</Text>
        );
      case 'icon_arrow_down':
        return (
          <Text style={styles}>&#xf102;</Text>
        );
      case 'icon_arrow_up':
        return (
          <Text style={styles}>&#xf106;</Text>
        );
      case 'icon_person':
        return (
          <Text style={styles}>&#xf111;</Text>
        );
      case 'icon_sync':
        return (
          <Text style={styles} >&#xf167;</Text>
        );
      case 'icon_success':
        return (
          <Text style={styles} >&#xf18e;</Text>
        );
      case 'icon_schneider_en':
        return (
          <Text style={styles}>&#xf146;</Text>
        )
      case 'icon_date':
        return (
          <Text style={styles}>&#xf149;</Text>
        )
      case 'icon_arrow_left':
        return (
          <Text style={styles}>&#xf103;</Text>
        )
      case 'icon_arrow_right':
        return (
          <Text style={styles}>&#xf104;</Text>
        )
      case 'icon_arrow_fold':
        return (
          <Text style={styles}>&#xf183;</Text>
        )
      case 'icon_arrow_unfold':
        return (
          <Text style={styles}>&#xf184;</Text>
        )
      case 'icon_info':
        return (
          <Text style={styles}>&#xf193;</Text>
        );
      case 'icon_info_down':
        return (
          <Text style={styles}>&#xf1f6;</Text>
        );
      case 'icon_info_empty':
        return (
          <Text style={styles}>&#xf227;</Text>
        );
      case 'icon_arrow_up':
        return (
          <Text style={styles}>&#xf106;</Text>
        )
      case 'icon_arrow_down':
        return (
          <Text style={styles}>&#xf102;</Text>
        )
      case 'icon_over_due':
        return (
          <Text style={styles}>&#xf186;</Text>
        )
      case 'icon_alarm_ticket':
        return (
          <Text style={styles}>&#xf187;</Text>
        )
      case 'icon_round':
        return (
          <Text style={styles}>&#xf22c;</Text>
        )
      case 'icon_healthy_indica':
        return (
          <Text style={styles}>&#xf22d;</Text>
        )
      case 'icon_close':
        return (
          <Text style={styles}>&#xf21b;</Text>
        )
      case 'icon_more':
        return (
          <Text style={styles}>&#xf195;</Text>
        );
      case 'icon_asset_folder':
        return (
          <Text style={styles}>&#xf21d;</Text>
        );
      case 'icon_asset_expand':
        return (
          <Text style={styles}>&#xf212;</Text>
        );
      case 'icon_asset_add':
        return (
          <Text style={styles}>&#xf210;</Text>
        );
      case 'icon_asset_customer':
        return (
          <Text style={styles}>&#xf111;</Text>
        );
      case 'icon_administration':
        return (
          <Text style={styles}>&#xf1b5;</Text>
        );
      case 'icon_asset_location':
        return (
          <Text style={styles}>&#xf1ab;</Text>
        );
      case 'icon_no_data':
        return (
          <Text style={styles}>&#xf20a;</Text>
        );
      case 'icon_mail':
        return (
          <Text style={styles}>&#xf1ba;</Text>
        );
      case 'icon_phone':
        return (
          <Text style={styles}>&#xf200;</Text>
        );
      case 'icon_ticket_msg':
        return (
          <Text style={styles}>&#xf268;</Text>
        );
      case 'icon_ticket_log':
        return (
          <Text style={styles}>&#xf244;</Text>
        );
      case 'icon_asset_bus_system':
        return (
          <Text style={styles}>&#xf26c;</Text>
        );
      case 'icon_asset_function_unit_group':
        return (
          <Text style={styles}>&#xf26a;</Text>
        );
      case 'icon_asset_socket_box':
        return (
          <Text style={styles}>&#xf26b;</Text>
        );
      case 'icon_runtime_status_fail':
        return (
          <Text style={styles}>&#xf18d;</Text>
        );
      case 'icon_runtime_status_ok':
        return (
          <Text style={styles}>&#xf18e;</Text>
        );
      case 'icon_runtime_conn':
        return (
          <Text style={styles}>&#xf162;</Text>
        );
      case 'icon_runtime_disconn':
        return (
          <Text style={styles}>&#xf163;</Text>
        );
      case 'icon_runtime_closed':
        return (
          <Text style={styles}>&#xf10b;</Text>
        );
      case 'icon_runtime_open':
        return (
          <Text style={styles}>&#xf10c;</Text>
        );

      case 'icon_ticket_tag':
        return (
          <Text style={styles}>&#xf1c9;</Text>
        )
      case 'icon_search':
        return (
          <Text style={styles}>&#xf12c;</Text>
        );
      case 'icon_download':
        return (
          <Text style={styles}>&#xf19f;</Text>
        );
      case 'icon_asset_loop':
        return (
          <Text style={styles}>&#xf275;</Text>
        );
      case 'icon_box_loop':
        return (
          <Text style={styles}>&#xf276;</Text>
        );
      case 'icon_circle_add':
        return (
          <Text style={styles}>&#xf241;</Text>
        );
      case 'icon_edit_pencil':
        return (
          <Text style={styles}>&#xf142;</Text>
        );
      case 'icon_del':
        return (
          <Text style={styles}>&#xf112;</Text>
        );
      case 'icon_add2':
        return (
          <Text style={styles}>&#xf119;</Text>
        );
    }
    return null;
  }
}

Icon.propTypes = {
  type:PropTypes.string.isRequired,
  color:PropTypes.string.isRequired,
  size:PropTypes.number.isRequired,
  style:PropTypes.any
};
