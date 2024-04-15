import React,{Component} from 'react';

import SQLiteStorage from 'react-native-sqlite-storage';

var database_name = "ds_rock_01.db";//数据库文件
var database_version = "1.0";//版本号
var database_displayname = "Rock_2019_11";
var database_size = -1;
var db;

// SQLite.DEBUG(true);
// SQLite.enablePromise(true);

export default class SQLite extends Component{
    componentWillUnmount(){
        if(db){
            this._successCB('close');
            db.close();
        }else {
            console.warn("SQLiteStorage not open");
        }
    }

    static getInstance(){
        return new SQLite();
    }

    open(){
        db = SQLiteStorage.openDatabase(
            database_name,
            database_version,
            database_displayname,
            database_size,
            ()=>{
                this._successCB('open');
            },
            (err)=>{
                this._errorCB('open',err);
            });
        return db;
    }

    executeSql(sql,params,callFunction){
        if (!db) {
            this.open();
        }
        db.transaction((tx)=>{
            tx.executeSql(sql, params,callFunction);
        },(error)=>{//打印异常信息
            console.warn("sql fail",sql,error);
            // console.warn(error);
        },()=>{
            console.warn('sql 执行成功',sql)
        });
    }

    close(){
        if(db){
            this._successCB('close');
            db.close();
        }else {
            console.warn("SQLiteStorage not open");
        }
        db = null;
    }

    _successCB(name){
        console.warn("SQLiteStorage "+name+" success");
    }

    _errorCB(name, err){
        console.warn("SQLiteStorage "+name);
        console.warn(err);
    }

    render(){
        return null;
    }
}
