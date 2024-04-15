import React,{Component} from 'react';
import {View,Text,TextInput,ScrollView,StyleSheet,InteractionManager,
  Platform,TouchableWithoutFeedback,Image,Dimensions,Keyboard} from 'react-native';
import {LIST_BG, LINE, GREEN, GRAY} from '../../styles/color';
import Icon from '../Icon';
import Toolbar from '../Toolbar';
import TouchFeedback from '../TouchFeedback';
import Picker from 'react-native-picker'
import CityData from '../../utils/amap_district_data.json';
import List from '../List'
import {getAddressByLocation,getAddressFromGPS,getGPSFromAddress,getAddress,
  getGPSFromAddressAndCity} from "../../utils/locationHelper";
const PanelSection=['中压一次AIS柜','中压一次GIS柜','中压二次柜','施耐德低压柜','其他'];

const municpality=[
  {key:'北京市',value:'北京城区'},
  {key:'上海市',value:'上海城区'},
  // {key:'重庆市',value:'重庆城区'},
  {key:'天津市',value:'天津城区'}
];

const PanelType=[
  [
    {key:'PIX',value:'MSAPI010',},
    {key:'PIX 50KA',value:'MSAPI011',},
    {key:'PIX 500',value:'MSAPI016',},
    {key:'DNF7',value:'MSADN001',},
    {key:'MVnex-12/24',value:'MSAMV001',},
  ],
  [
    {key:'WSG',value:'MSGGH001'},
    {key:'WIG',value:'MSGGH002'},
    {key:'GMA',value:'MSGGM001'},
  ],
  [
    {key:'FBX',value:'MSGFB001'},
    {key:'RM6',value:'MSGRM001'},
    {key:'RM6-S',value:'MSGFB002'},
    {key:'RM6-S PLUS',value:'MSGRM002'},
    {key:'FLUSARC',value:'MSGFL001'},
    {key:'PREMSET',value:'SWITCHBOARD_MV'},
    {key:'SM6',value:'SWITCHBOARD_MV'},
  ],
  [
    {key:'Blokset低压柜',value:'LVESWBC_BLOKSET'},
    {key:'BM6 Plus低压柜',value:'LVESWBC_BM6PLUS'},
    {key:'BM6低压柜',value:'LVESWBC_BM6'},
    {key:'Prisma E低压柜',value:'LVESWBC_PRISMAE'},
    {key:'Okken低压柜',value:'LVESWBI_OKKEN'},
    {key:'Blokset MB低压柜',value:'LVESWBI_BLOKSETMB'},
    {key:'Prisma iPM低压柜',value:'LVESWBI_PRISMAIPM'},
    {key:'Blokset 5000低压柜',value:'LVESWBC_B5000'},
    {key:'OKKENL低压柜',value:'LVESWBC_OKKENL'},
  ],
  [
    {key:'其它低压电气柜',value:'无'},
    {key:'其它中压电气柜',value:'无'},
    {key:'其它',value:'无'},
  ]
];

const useMapView = false;

export default class AssetNameEditView extends Component{

  constructor(props){
    super(props);
    let gps={latitude:0,longitude:0};
    if(this.props.location&&this.props.location.Latitude&&this.props.location.Longitude){
      gps={latitude:this.props.location.Latitude,longitude:this.props.location.Longitude};
    }
    this.state= {
      inputText: this.props.name,
      location: this.props.location || {},
      selectedType: this.props.panelType,
      pickerAddress: this._formatAddress(this.props.location),
      expandIndex: {},
      gpsLocation: gps,
      currentGPS: {latitude:0,longitude:0},
      centerGPS:{...gps},
      inputAddress:this.props.location?this.props.location.Province:''
    }
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.name!==this.props.name){
      this.setState({
        inputText:nextProps.name
      })
    }
  }
  _formatAddress(location){
    if(location && location.Districts && location.Districts.length>0){
      console.warn('districts',location.Districts);
      return location.Districts.join(' ');
    }
    return '';
  }

  _renderTypes(){
    if(this.props.type!='Panel') return null;
    /**
    //KYN中压柜、PIX中压柜、MVnex中压柜 B5000低压柜和OKKENL低压柜
    let panelTypes=[
      {key:'LVESWBC_BLOKSET',value:'Blokset低压柜'},
      {key:'LVESWBC_BM6PLUS',value:'BM6 Plus低压柜'},
      {key:'LVESWBC_BM6',value:'BM6低压柜'},
      {key:'LVESWBC_PRISMAE',value:'Prisma E低压柜'},
      {key:'LVESWBI_OKKEN',value:'Okken低压柜'},
      {key:'LVESWBI_BLOKSETMB',value:'Blokset MB低压柜'},
      {key:'LVESWBI_PRISMAIPM',value:'Prisma iPM低压柜'},
      {key:'LVESWBI_KYN中压柜',value:'KYN中压柜'},
      {key:'LVESWBI_PIX中压柜',value:'PIX中压柜'},
      {key:'LVESWBI_MVnex中压柜',value:'MVnex中压柜'},
      {key:'LVESWBI_B5000低压柜',value:'Blokset 5000低压柜'},
      {key:'LVESWBI_OKKENL低压柜',value:'OKKENL低压柜'},
      {key:'OTHERS',value:'其它柜型'}
    ];
    let panelViews=panelTypes.map((item,index)=>{
      let checked=item.value==this.state.selectedType;
      return (
        <TouchFeedback key={index} onPress={()=>{
          this.setState({
            selectedType:item.value
          })
        }}>
          <View style={{paddingVertical:16,flexDirection:'row',alignItems:'center'}}>
            <View style={checked?styles.selectView:styles.unSelectView}>
              {checked?<Icon type='icon_check' size={17} color='white'/>:null}
            </View>
            <Text style={{fontSize:17,color:'#333',marginLeft:16}}>{item.value}</Text>
          </View>
        </TouchFeedback>
      )
    });
    /***/

    let groupView=[];
    for(let i=0;i<PanelSection.length;i++){
      let isExpand=this.state.expandIndex[i];
      let section=(
        <TouchFeedback onPress={()=>{
          let expandIndex={...this.state.expandIndex};
          expandIndex[i]= !expandIndex[i];
          this.setState({
            expandIndex: expandIndex
          })
        }}>
          <View key={PanelSection[i]} style={{height:55,flexDirection:'row',alignItems:'center'}}>
            <Icon type={isExpand?'icon_asset_expand':'icon_asset_folder'} color={'#b2b2b2'} size={18}/>
            <Text style={{fontSize:17,color:'#333',marginLeft:10}}>{PanelSection[i]}</Text>
          </View>
        </TouchFeedback>

      )
      groupView.push(section);
      if(isExpand){
        let groupItems=PanelType[i].map((item,index)=>{
          let checked=item.key===this.state.selectedType;
          return (
            <TouchFeedback key={item.key} onPress={()=>{
              this.setState({
                selectedType:item.key
              })
            }}>
              <View style={{paddingLeft:28,paddingVertical:16,flexDirection:'row',alignItems:'center'}}>
                <View style={checked?styles.selectView:styles.unSelectView}>
                  {checked?<Icon type='icon_check' size={17} color='white'/>:null}
                </View>
                <Text style={{fontSize:17,color:'#333',marginLeft:16}}>{item.key}</Text>
              </View>
            </TouchFeedback>
          )
        });
        groupView.push(groupItems);
      }
    }

    return (
      <View style={{flex:1}}>
      <ScrollView style={{marginTop:0,paddingLeft:16,backgroundColor:'white',borderTopWidth:1,
        borderBottomWidth:1,borderColor:LINE}}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        >
        <View style={{paddingVertical:16,borderBottomWidth:1,borderBottomColor:LINE}}>
          <Text style={{fontSize:17,color:'#333'}}>型号</Text>
        </View>
        {groupView}
      </ScrollView>
      </View>
    )
  }

  _getCurrentCity(){
    let city='';
    if(this.state.location.Districts){
      let p=this.state.location.Districts[0];
      let c=this.state.location.Districts[1];
      let special=['北京市','上海市','重庆市','天津市','澳门特别行政区','香港特别行政区','台湾省'];
      if(special.findIndex(item=>item===p)>=0) return p;
      return c;
    }
    return city;
  }

  _onChange(e){
    if(!useMapView) return;
    e=e.nativeEvent;
    let text=e.text||'';
    text=text.trim();
    if(text.length===0) return;
    let duration=2000;
    let lastChange=this._lastChange||0;
    let _duration=Date.now()-lastChange;
    let city=this._getCurrentCity();
    let next=(text,city)=>{
      getGPSFromAddressAndCity(text,city,res=>{
        let pos={
          latitude:Number(res.latitude),
          longitude:Number(res.longitude)
        };
        //设置地址
        this.setState({
          gpsLocation: pos,
          centerGPS: pos,
        },()=>{
          this._setGPSAddress('',res.address,true);
        })
      },err=>{});
    };
    if(_duration>duration){
      this._lastChange=Date.now();
      next(text,city);
    }else{
      //取消之前的
      clearTimeout(this._queryByAddress);
      this._queryByAddress=setTimeout(()=>{
        next(text,city);
      },duration);
    }
  }

  _onChangeText(type,text){
    if(type==='address'){
      this.setState({
        // address: text
        // location: {...this.state.location,Province:text}
        inputAddress: text
      })
    }else {
      this.setState({
        inputText: text
      })
    }
  }

  _enableSubmit() {
    let text = this.state.inputText;
    if (!text || text.trim().length < 1) return false;
    if(this.props.type==='building'){
      let location=this.state.location;
      // if(!address || address.trim().length<1) return false;
      if(!location || !location.Districts || location.Districts.length===0 ||
        !this.state.inputAddress || this.state.inputAddress.trim().length===0){
        return false;
      }
    }
    if (this.props.type === 'Panel' && !this.state.selectedType) return false;
    return true;
  }

  _setGPSAddress(address,data,noChange){
    let districts=[data.province,data.city,data.district];
    if(districts[1]&&districts[1].length===0) districts[1]='';
    if(districts[2]&&districts[2].length===0) districts[2]='';

    if(districts[0]==='重庆市'){
      let item=CityData.districts[0].districts.find(item=>item.name==='重庆市');
      let index=item.districts[0].districts.findIndex(item=>item.name===districts[2]);
      if(index>=0) districts[1]=item.districts[0].name;
      else districts[1]=item.districts[1].name;
    }else if(districts[0].indexOf('香港')===0 || districts[0].indexOf('澳门')===0){
      //香港澳门只有province和city两级
      districts[1]=districts[2];
      districts[2]='';

    }else{
      let findItem=municpality.find(item=>item.key===districts[0]);
      if(findItem){
        districts[1]=findItem.value;
      }
    }
    let p={}
    if(!noChange){
      p={
        Province: address
      };
    }
    this.setState({
      pickerAddress: districts.join(' '),
      location: {...this.state.location,Districts:districts,...p}
    })
  }

  _initDistrict(){
    if(this.state.location){
      if(this.state.location.Districts &&
        !this.state.location.Districts[1]){
        //如果是重庆市，比较特殊，做处理
        if(this.state.location.Districts[0]==='重庆市'){
          let item=CityData.districts[0].districts.find(item=>item.name==='重庆市');
          let index=item.districts[0].districts.findIndex(item=>item.name===this.state.location.Districts[2]);
          if(index>=0) this.state.location.Districts[1]=item.districts[0].name;
          else this.state.location.Districts[1]=item.districts[1].name;
        }else{
          let findItem=municpality.find(item=>item.key===this.state.location.Districts[0]);
          if(findItem){
            this.state.location.Districts[1]=findItem.value;
          }
        }
      }
      return this.state.location.Districts;
    }
    return [];
  }

  _pickAddress(){
    Keyboard.dismiss();
    let address=[];
    CityData.districts[0].districts.forEach(province=>{
      //添加省
      let p={}
      p[province.name]=[];
      if(!province.districts || province.districts.length===0){
        p[province.name].push({'':['']})
      }else{
        province.districts.forEach(city=>{
          //添加城市
          let c={};
          if(city.districts.length>0){
            c[city.name]=city.districts.map(county=>{
              return county.name
            });
          }else{
            c[city.name]=[''];
          }
          p[province.name].push(c);
        })
      }
      address.push(p);
    });

    Picker.init({
      pickerCancelBtnText:'取消',
      pickerConfirmBtnText:'确定',
      pickerTitleText:'选择地址',
      pickerData: address,
      selectedValue:this._initDistrict(),
      onPickerConfirm: data => {
        let address = data.join(' ');
        this.setState({
          pickerAddress: address,
          location: {...this.state.location,Districts:data}
        })
        if (useMapView && address.length>0) {
          getGPSFromAddress(address,
          (res)=>{
            res.latitude=Number(res.latitude);
            res.longitude=Number(res.longitude);
            this.setState({
              gpsLocation: res,
              centerGPS: res,
            })
            getAddressByLocation(res,res=>{
              this._setGPSAddress(res.address,res.addressComponent)
            },err=>{
              console.warn('定位转地址出错:',err);
            })
          },
          ()=>{

          })
        }
      },
      onPickerCancel: data => {
      },
      onPickerSelect: data => {
      }
    });
    Picker.show();
  }

  componentWillUnmount(){
    Picker.hide();
    Keyboard.dismiss();
  }

  _onFocus(e){
    Picker.hide();
  }

   _renderInputAdderss(){
    if(this.props.type==='building'){
      let clearButton=null;
      if(this.state.location.Province&&this.state.location.Province.trim().length>0){
        clearButton=(
          <TouchFeedback onPress={()=>{
            this._onChangeText('address','');
          }}>
            <View style={{marginLeft:12,marginTop:Platform.OS==='ios'?6:4}}>
              <Icon type="icon_unselect" color={'#ccc'} size={15}/>
            </View>
          </TouchFeedback>
        )
      }
      let label='请选择';
      if(this.state.pickerAddress&&this.state.pickerAddress.trim().length>0){
        label=this.state.pickerAddress;
      }
      return (
        <View>
          <TouchFeedback onPress={()=>Keyboard.dismiss()}>
            <View>
          <View style={{flexDirection:'row',padding:16,backgroundColor:'white',alignItems:'flex-start'}}>
            <Text style={{fontSize:17,color:'#333',width:80}}>所在地区</Text>
            <View style={{flex:1,}}>
              <TouchFeedback onPress={()=>this._pickAddress()}>
                <Text numberOfLines={3} style={{fontSize:17,paddingVertical:0,color:'#888',marginLeft:20}}>
                  {label}
                </Text>
              </TouchFeedback>
            </View>
          </View>
                <View style={{backgroundColor:'white'}}>
                    <View style={{height:1, backgroundColor:LINE,marginHorizontal:16}} />
                </View>
          <View style={{flexDirection:'row',padding:16,backgroundColor:'white',height:128,alignItems:'flex-start'}}>
            <Text style={{fontSize:17,color:'#333',width:80,marginTop:Platform.OS==='ios'?5:0}}>详细地址</Text>
            <View style={{flex:1,flexDirection:'row'}}>
              <TextInput numberOfLines={3} style={{flex:1,fontSize:17,height:100,textAlignVertical: 'top',paddingVertical:0,color:'#888',marginLeft:20}}
                 value={this.state.inputAddress} placeholder={'请输入'} multiline={true} onFocus={this._onFocus}
                 placeholderTextColor={'#d0d0d0'} underlineColorAndroid="transparent" onChange={this._onChange.bind(this)}
                 onChangeText={text=>this._onChangeText('address',text)} enablesReturnKeyAutomatically={true}/>
              {clearButton}
            </View>
          </View>

            </View>
          </TouchFeedback>

          {
          // this._renderMap(false)
          }
        </View>
      );
    }
  }

  _showCenterMaker(){
    if(this.state.centerGPS.latitude>0){
      let width=Dimensions.get('window').width;
      return (
        <Image style={{width:27,height:37,position:'absolute',top:228/2-37,left:width/2-13.5,zIndex:1000}}
               source={require('../../images/location/RED.png')}/>
      )
    }
    return null;
  }

  _getSubmitLocation(){
    let districts=[].concat(this.state.location.Districts);
    let index=municpality.findIndex(item=>item.key===districts[0]);
    if(index>=0){
      districts[1]='';
    }
    return {...this.state.location,Province: this.state.inputAddress,Districts: districts,loc:this.state.gpsLocation};
  }

  _doSubmit(){
    Keyboard.dismiss();
    Picker.hide();
    this.props.submit(this.state.inputText,this.state.selectedType,this._getSubmitLocation());
  }

  render(){
    let width={};
    let flex = {};
    if(this.props.type==='building'){
      width={width:80};
    } else if(this.props.type === 'Panel') {
        flex = {flex:1};
    }
    return (
      <View style={{flex:1,backgroundColor:LIST_BG}} >
        <Toolbar
          title={this.props.title}
          navIcon="back"
          noShadow={true}
          onIconClicked={()=>this.props.onBack()}
          actions={[{title:'完成',show:'always',disable:!this._enableSubmit()}]}
          onActionSelected={[()=>this._doSubmit()]}
        />
        <TouchFeedback style={[flex]} onPress={()=>Keyboard.dismiss()}>
          <View style={[flex]}>
        <View style={{flexDirection:'row',marginVertical:10,paddingHorizontal:16,paddingVertical:8,backgroundColor:'white',alignItems:'center',borderColor:LINE,
          borderBottomWidth:1}}>
          <Text style={{fontSize:17,color:'#333',...width}}>名称</Text>
          <View style={{flex:1,}}>
          <TextInput numberOfLines={1} style={{fontSize:17,paddingVertical:0,color:'#888',marginLeft:20,marginRight:30}}
            value={this.state.inputText} placeholder={'请输入'} onFocus={this._onFocus}
            placeholderTextColor={'#d0d0d0'} underlineColorAndroid="transparent" returnKeyType={'done'} returnKeyLabel={'完成'}
            onChangeText={text=>this._onChangeText('name',text)} enablesReturnKeyAutomatically={true} autoFocus={true}/>
          </View>
          
        </View>
        {this._renderTypes()}
          </View>
        </TouchFeedback>
        {this._renderInputAdderss()}
      </View>

    )
  }
}

const styles=StyleSheet.create({
  selectView:{
    width:22,
    height:22,
    borderRadius:11,
    backgroundColor:GREEN,
    // paddingRight:10,
    justifyContent:'center',
    alignItems:'center'
  },
  unSelectView:{
    width:22,
    height:22,
    borderRadius:11,
    borderColor:GRAY,
    borderWidth:1,
    // marginRight:16,
    justifyContent:'center',
    alignItems:'center'
  },
});
