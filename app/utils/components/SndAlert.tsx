import React from "react";
import {Modal} from "@ant-design/react-native";
import {Text} from "react-native";
import {Action} from "@ant-design/react-native/lib/modal/PropsType";
import Colors from "../const/Colors";

export default {
    alert(title?: string, content?: string, actions?: Action[], p?: { cancelable: boolean }){
        Modal.defaultProps.style = {
            backgroundColor: Colors.seBgElevated,
        }
        Modal.alert(
            title && title.length > 0 && <Text style={{fontSize: 16, fontWeight:'bold', color: Colors.seTextPrimary}}>{title}</Text>,
            content && content.length > 0 && <Text style={{fontSize: 13, color: Colors.seTextSecondary}}>{content}</Text>,
            // @ts-ignore
            actions && [
                ...actions?.map((action)=>{
                    return {
                        ...action,
                        style: {
                            fontSize: 16,
                            fontWeight:'bold',
                            color: Colors.seInfoNormal,
                        }
                    }
                })
            ],
            ()=>p?.cancelable
        )
    }
}
