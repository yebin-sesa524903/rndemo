'use strict'
/*
 react-native-swiper

 @author leecade<leecade@163.com>

 react-native-swiper2

 @author sunnylqm
 */
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  //ViewPagerAndroid,
  ViewPropTypes
} from 'react-native'
import ViewPager from '@react-native-community/viewpager';
const ViewPagerAndroid=ViewPager;
// Using bare setTimeout, setInterval, setImmediate
// and requestAnimationFrame calls is very dangerous
// because if you forget to cancel the request before
// the component is unmounted, you risk the callback
// throwing an exception.
import TimerMixin from 'react-timer-mixin'

let { width, height } = Dimensions.get('window')

/**
 * Default styles
 * @type {StyleSheetPropType}
 */
let styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    position: 'relative',
  },

  wrapper: {
    backgroundColor: 'transparent',
  },

  slide: {
    backgroundColor: 'transparent',
  },

  pagination: {
    position: 'absolute',
    bottom: 25,
    left: 0,
    right: 0,
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'transparent',
  },


  title: {
    height: 30,
    justifyContent: 'center',
    position: 'absolute',
    paddingLeft: 10,
    bottom: -30,
    left: 0,
    flexWrap: 'nowrap',
    width: 250,
    backgroundColor: 'transparent',
  },

  buttonWrapper: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    position: 'absolute',
    top: 0,
    left: 0,
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  buttonText: {
    fontSize: 50,
    color: '#007aff',
    fontFamily: 'Arial',
  },
})

export default React.createClass({

  /**
   * Props Validation
   * @type {Object}
   */
  propTypes: {
    horizontal                       : PropTypes.bool,
    children                         : PropTypes.node.isRequired,
    style                            : ViewPropTypes.style,
    pagingEnabled                    : PropTypes.bool,
    showsHorizontalScrollIndicator   : PropTypes.bool,
    showsVerticalScrollIndicator     : PropTypes.bool,
    bounces                          : PropTypes.bool,
    scrollsToTop                     : PropTypes.bool,
    removeClippedSubviews            : PropTypes.bool,
    automaticallyAdjustContentInsets : PropTypes.bool,
    showsPagination                  : PropTypes.bool,
    showsButtons                     : PropTypes.bool,
    loop                             : PropTypes.bool,
    autoplay                         : PropTypes.bool,
    autoplayTimeout                  : PropTypes.number,
    autoplayDirection                : PropTypes.bool,
    index                            : PropTypes.number,
    renderPagination                 : PropTypes.func,
    onPageChanged                    : PropTypes.func,
  },

  mixins: [TimerMixin],

  /**
   * Default props
   * @return {object} props
   * @see http://facebook.github.io/react-native/docs/scrollview.html
   */
  getDefaultProps() {
    return {
      horizontal                       : true,
      pagingEnabled                    : true,
      showsHorizontalScrollIndicator   : false,
      showsVerticalScrollIndicator     : false,
      bounces                          : false,
      scrollsToTop                     : false,
      removeClippedSubviews            : true,
      automaticallyAdjustContentInsets : false,
      showsPagination                  : true,
      showsButtons                     : false,
      loop                             : true,
      autoplay                         : false,
      autoplayTimeout                  : 2.5,
      autoplayDirection                : true,
      index                            : 0,
    }
  },

  /**
   * Init states
   * @return {object} states
   */
  getInitialState() {
    let props = this.props

    let initState = {
      autoplayEnd: false,
    }

    initState.total = props.children
      ? (props.children.length || 1)
      : 0

    initState.index = initState.total > 1
      ? Math.min(props.index, initState.total - 1)
      : 0

    // Default: horizontal
    initState.width = props.width || width
    initState.height = props.height || height

    return initState
  },

  /**
   * autoplay timer
   * @type {null}
   */
  autoplayTimer: null,

  componentWillMount() {
    this.props = this.injectState(this.props)
  },

  componentDidMount() {
    this.autoplay()
  },

  autoplay(){
    if(!this.props.autoplay
      || this.state.autoplayEnd) return;
    console.log("Will autoplay.");
    clearTimeout(this.autoplayTimer)
    this.autoplayTimer = this.setTimeout(() => {
      if(!this.props.loop && (this.props.autoplayDirection
          ? this.state.index == this.state.total - 1
          : this.state.index == 0)) return this.setState({
        autoplayEnd: true
      })
      this.viewPager && console.log("Now autoplay."+this.state.index + (this.props.loop?1:0) +(this.props.autoplayDirection?1:-1));
      this.viewPager && this.viewPager.setPage(this.state.index + (this.props.loop?1:0) +(this.props.autoplayDirection?1:-1));
    }, this.props.autoplayTimeout * 1000)
  },

  onPageSelected(ev){
    let page = ev.nativeEvent.position;
    const hasLoop = this.props.loop && this.state.total > 1;

    const lastPage = this.state.index + (hasLoop ? 1 : 0);

    if (page !== lastPage){
      this.setState({
        index: page,
      });
      this.props.onPageChanged && this.props.onPageChanged(page);
    }
  },

  onPageScroll(ev){
    const hasLoop = this.props.loop && this.state.total > 1;
    const lastPage = this.state.index + (hasLoop ? 1 : 0);

    let page = ev.nativeEvent.position;
    if (hasLoop){
      // do Loop
      if (page + ev.nativeEvent.offset <= 0){
        page = this.state.total;
        this.viewPager && this.viewPager.setPageWithoutAnimation(page);
      } else if(page+ev.nativeEvent.offset >= this.state.total+1){
        page = 1;
        this.viewPager && this.viewPager.setPageWithoutAnimation(page);
      }
    }
    this.autoplay();


  },

  renderScrollView(pages) {
    return (
      <ViewPagerAndroid
          style={{flex: 1}}
          initialPage={this.props.index + (this.props.loop?1:0)}
          onPageSelected={this.onPageSelected}
          onPageScroll={this.onPageScroll}
          ref = {val=>this.viewPager = val }
      >
        {pages}
      </ViewPagerAndroid>
    );
  },

  /**
   * Scroll by index
   * @param  {number} index offset index
   */
  scrollTo(indexOffset) {
    let newIndex = (this.props.loop ? 1 : 0) + indexOffset + this.state.index
    this.viewPager && this.viewPager.setPage(newIndex);
  },

  /**
   * Render pagination
   * @return {object} react-dom
   */
  renderPagination() {

    // By default, dots only show when `total` > 2
    if(this.state.total <= 1) return null

    let dots = []
    let ActiveDot = this.props.activeDot || <View style={{
            backgroundColor: '#007aff',
            width: 8,
            height: 8,
            borderRadius: 4,
            marginLeft: 3,
            marginRight: 3,
            marginTop: 3,
            marginBottom: 3,
          }} />;
    let Dot = this.props.dot || <View style={{
            backgroundColor:'rgba(0,0,0,.2)',
            width: 8,
            height: 8,
            borderRadius: 4,
            marginLeft: 3,
            marginRight: 3,
            marginTop: 3,
            marginBottom: 3,
          }} />;
    for(let i = 0; i < this.state.total; i++) {
      dots.push(i === this.state.index
        ?
        React.cloneElement(ActiveDot, {key: i})
        :
        React.cloneElement(Dot, {key: i})
      )
    }

    return (
      <View pointerEvents='none' style={[styles.pagination, this.props.paginationStyle]}>
        {dots}
      </View>
    )
  },

  renderTitle() {
    let child = this.props.children[this.state.index]
    let title = child && child.props.title
    return title
      ? (
      <View style={styles.title}>
        {this.props.children[this.state.index].props.title}
      </View>
    )
      : null
  },

  renderButtons() {

    let nextButton = this.props.nextButton || <Text style={[styles.buttonText, {color: !this.props.loop && this.state.index == this.state.total - 1 ? 'rgba(0,0,0,0)' : '#007aff'}]}>›</Text>

    let prevButton = this.props.prevButton || <Text style={[styles.buttonText, {color: !this.props.loop && this.state.index == 0 ? 'rgba(0,0,0,0)' : '#007aff'}]}>‹</Text>

    return (
      <View pointerEvents='box-none' style={[styles.buttonWrapper, {width: this.state.width, height: this.state.height}, this.props.buttonWrapperStyle]}>
        <TouchableOpacity onPress={() => !(!this.props.loop && this.state.index == 0) && this.scrollTo.call(this, -1)}>
          <View>
            {prevButton}
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => !(!this.props.loop && this.state.index == this.state.total - 1) && this.scrollTo.call(this, 1)}>
          <View>
            {nextButton}
          </View>
        </TouchableOpacity>
      </View>
    )
  },

  /**
   * Inject state to ScrollResponder
   * @param  {object} props origin props
   * @return {object} props injected props
   */
  injectState(props) {
    /*    const scrollResponders = [
     'onMomentumScrollBegin',
     'onTouchStartCapture',
     'onTouchStart',
     'onTouchEnd',
     'onResponderRelease',
     'onPageChanged',
     ]*/

    for(let prop in props) {
      // if(~scrollResponders.indexOf(prop)
      if(typeof props[prop] === 'function'
        && prop !== 'onMomentumScrollEnd'
        && prop !== 'renderPagination'
        && prop !== 'onScrollBeginDrag'
        && prop !== 'onPageChanged'
      ) {
        let originResponder = props[prop]
        props[prop] = (e) => originResponder(e, this.state, this)
      }
    }

    return props
  },
  componentWillReceiveProps(nextProps) {
    // console.warn('nextProps',nextProps);
    if(nextProps.index !== this.props.index){
      // console.warn('scrollTo',nextProps.index);
      // this.scrollTo(nextProps.index)
      this.viewPager && this.viewPager.setPage(nextProps.index);
      // this.setState({index:nextProps.index});
    }
  },
  shouldComponentUpdate(nextProps, nextState) {
    if(nextProps.children.length === this.props.children.length &&
      nextProps.index === this.props.index){
        return false;
      }
    return true;
  },
  /**
   * Default render
   * @return {object} react-dom
   */
  render() {
    let state = this.state
    let props = this.props
    let children = props.children
    let index = state.index
    let total = state.total
    let loop = props.loop
    let dir = state.dir
    let key = 0

    let pages = []
    let pageStyle = [{width: state.width, height: state.height}, styles.slide]

    // For make infinite at least total > 1
    if(total > 1) {

      // Re-design a loop model for avoid img flickering
      pages = Object.keys(children)
      if(loop) {
        pages.unshift(total - 1)
        pages.push(0)
      }

      pages = pages.map((page, i) =>
        <View style={pageStyle} key={i}>{children[page]}</View>
      )
    }
    else pages = <View style={pageStyle}>{children}</View>

    return (
      <View style={[styles.container, {
        width: state.width,
        height: state.height
      }]}>
        {this.renderScrollView(pages)}
        {props.showsPagination && (props.renderPagination
          ? this.props.renderPagination(state.index, state.total, this)
          : this.renderPagination())}
        {this.renderTitle()}
        {this.props.showsButtons && this.renderButtons()}
      </View>
    )
  }
})
