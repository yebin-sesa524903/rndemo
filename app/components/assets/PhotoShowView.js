
'use strict';
import React,{Component} from 'react';
import {
  View,
  StyleSheet,
  InteractionManager
} from 'react-native';
import PropTypes from 'prop-types';

// import Swiper from '../Swiper';
import Toolbar from '../Toolbar';
import Gallery from './Gallery';
import PhotoRow from './PhotoRow.js';

export default class PhotoShowView extends Component{
  constructor(props){
    super(props);
    this.state={currIndex:0,showPhoto:false};
  }
  componentDidMount() {
    InteractionManager.runAfterInteractions(()=>{
      this._showPhoto();
    });
  }
  _showPhoto(){
    this.setState({showPhoto:true});
  }
  _onActionRemove()
  {
    if (this.props.checkAuth()) {
      // console.warn('start _onActionRemove',this.props.index,this.props.data.size);
      // if (this.props.data.size>=1) {
      //   console.warn('jump to page:',this.props.index);
      //   this._swiper.goToPage(parseInt(this.props.index-1));
      // }
      if (this.props.data.size>2) {
        var index = parseInt(this.props.index);
        if (index===this.props.data.size-1) {
          // console.warn('jump to page:',index-1);
          // this._swiper.scrollTo(parseInt(index-1));
        }
      }
      else {
        // this._swiper.scrollTo(0);
      }
      if (String(this.props.data.size-1)===this.props.index) {
        this.refs['galleryRef'].resetCurrIndex(this.props.index-1);
      }else {
        this.refs['galleryRef'].resetCurrIndex(this.props.index);
      }
      // this.refs['galleryRef'].resetCurrIndex(this.props.index);
      this.props.onRemoveItem();
    }
  }
  _getToolbar(){
    var actions = null;
    if(this.props.type !== 'singlePhoto' && this.props.canEdit){
      var code = 'TicketExecutePrivilegeCode';
      if (this.props.type==='assetLogPhoto') {
        code = 'AssetEditPrivilegeCode';
      }else if (this.props.type === 'ticketLogPhoto') {
        code = 'TicketExecutePrivilegeCode';
      }else if (this.props.type==='feedbackLogPhoto') {
        code = 'FeedbackPrivilegeCode';
      }
      // var code = this.props.type === 'ticketLogPhoto'?'TicketExecutePrivilegeCode':'AssetEditPrivilegeCode';
      actions = [{
        title:'删除',
        iconType:'delete',
        code:code,
        show: 'always', showWithText: false}];
    }
    var numIndex = parseInt(this.props.index)+1;
    var title=this.props.type !== 'singlePhoto'?'图片':'资产文档';
    return (
      <Toolbar
        title={title+'('+(numIndex)+'/'+this.props.data.size+')'}
        navIcon="back"
        actions={actions}
        onActionSelected={[()=>this._onActionRemove()]}
        onIconClicked={this.props.onBack}
        />
    );
  }
  // _renderRows(){
  //   var items = this.props.data.map((item,index)=>{
  //     return(
  //       <View key={index} style={{flex:1}}>
  //         <PhotoRow
  //           rowData={item}
  //           rowId={String(index)}
  //           type={this.props.type}
  //           render={this.props.index === index.toString()}
  //           onRowClick={this.props.onRowClick}/>
  //       </View>
  //       )
  //   }).toArray();
  //   return items;
  // }
  _getContentView()
  {
    var images=this.props.data.map((rowData,index)=>{
        var imgKey = this.props.type!=='singlePhoto'?'PictureId':'ImageId';
        // var contentKey = this.props.type!=='singlePhoto'?'Content':'Description';
        var name = rowData.get(imgKey);
        // var context = rowData.get(contentKey);
        // console.warn('contentKey',imgKey,contentKey,rowData);

        //如果有uri,优先显示uri的（本来已有的图片）
        if(rowData.get('uri')){
          name = rowData.get('uri');
        }
        if (!name) {
          name = rowData.get('uri');
        }
        return name;
      }
    ).toArray();
    var texts=this.props.data.map((rowData,index)=>{
        // var imgKey = this.props.type!=='singlePhoto'?'PictureId':'ImageId';
        var contentKey = this.props.type!=='singlePhoto'?'Content':'Description';
        // var name = rowData.get(imgKey);
        var context = rowData.get(contentKey);
        return context;
      }
    ).toArray();

    // if(!this.state.showPhoto){
    //   return (
    //     <View style={{flex:1,backgroundColor:'black'}}>
    //       <Loading/>
    //     </View>
    //   );
    // }else {
      return (
        <Gallery
          ref='galleryRef'
          style={{flex: 1, backgroundColor: 'black',zIndex:2}}
          index={parseInt(this.props.index)}
          images={images}
          thumbImageInfo={this.props.thumbImageInfo}
          texts={texts}
          onPageChanged={(index)=>{
              this.props.onPageChange(index)
          }}
        />
      );
    // }
  }
  render() {
    return (
      <View style={{flex:1,backgroundColor:'black'}}>
        {this._getToolbar()}
        {this._getContentView()}
      </View>
    );
  }
}



// <Swiper ref={(swip)=>{this._swiper=swip;}}
//   loop={false}
//   showsPagination={false}
//   style={styles.wrapper}
//   index={parseInt(this.props.index)}
//   onPageChanged={(index)=>{
//     this.props.onPageChange(index)
//   }}
//   >
//   {this._renderRows()}
// </Swiper>

PhotoShowView.propTypes = {
  user:PropTypes.object,
  onRowClick:PropTypes.func.isRequired,
  onPageChange:PropTypes.func.isRequired,
  onRemoveItem:PropTypes.func,
  checkAuth:PropTypes.func,
  swiper:PropTypes.object,
  data:PropTypes.object,
  thumbImageInfo:PropTypes.object,
  index:PropTypes.string,
  type:PropTypes.string,
  onBack:PropTypes.func.isRequired,
  canEdit:PropTypes.bool
}

var styles = StyleSheet.create({
  wrapper: {
    backgroundColor:'black',
    // flex:1,
  },
})
