
import React from "react";
import {
    Image,
    StyleSheet, Text, View

} from "react-native";
import Colors from "../../../../utils/const/Colors";
import {RefreshList, RefreshListProps} from "../../../../utils/refreshList/RefreshList";

export interface PaddingRadiusListProps extends RefreshListProps{
    headerTitle?: string,
    headerIcon?: any,
}

export function PaddingRadiusList(props: PaddingRadiusListProps) {
    const renderListHeader = ()=>{
        return (
            <View style={styles.headerContainer}>
                <Image source={props.headerIcon}/>
                <Text style={{fontSize: 15, color: Colors.text.primary, marginLeft: 12}}>{props.headerTitle}</Text>
            </View>
        )
    }

    const renderListFooter = ()=>{
        return (
            <View style={styles.footerContainer}/>
        )
    }

    const renderItemSeparator = ()=>{
        return (
            <View style={{backgroundColor: Colors.white, marginLeft: 12, marginRight: 12}}>
                <View style={styles.itemSeparatorView}/>
            </View>
        )
    }

    return (
        <RefreshList {...props}
                     renderSectionHeader={()=>renderListHeader()}
                     renderSectionFooter={()=>renderListFooter()}
                     ItemSeparatorComponent={(leader)=>renderItemSeparator()}
                     />

    )
}


const styles = StyleSheet.create({
    headerContainer:{
        flexDirection: 'row',
        alignItems:'center',
        paddingLeft: 12,
        marginLeft: 12,
        marginRight: 12,
        backgroundColor: Colors.white,
        marginTop: 10,
        height: 36,
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
    },
    footerContainer:{
        backgroundColor: Colors.white,
        height: 3,
        borderBottomLeftRadius: 3,
        borderBottomRightRadius: 3,
        marginLeft: 12,
        marginRight: 12,
    },
    itemSeparatorView:{
        backgroundColor:Colors.gray.primary,
        height: 1,
        marginLeft: 15,
        marginRight: 15,
    }
})
