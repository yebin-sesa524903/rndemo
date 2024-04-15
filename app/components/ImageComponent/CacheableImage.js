import React,{Component} from 'react';
import {Image, ActivityIndicator, Platform, View, Dimensions} from 'react-native';
import PropTypes from 'prop-types';
import RNFS, { DocumentDirectoryPath } from 'react-native-fs';
import ResponsiveImage from './ResponsiveImage';
import NetInfo from "@react-native-community/netinfo";
import Loading from '../Loading';

const SHA1 = require("crypto-js/sha1");
const URL = require('url-parse');
import storage from '../../utils/storage.js';
import {getBaseUri,TOKENHEADER,JWTTOKENHEADER,HEADERDEVICEID} from '../../middleware/api.js';
import {isLocalFile} from "../../utils/fileHelper";

const saveDocumentPath = Platform.OS === 'ios' ? DocumentDirectoryPath : RNFS.ExternalDirectoryPath;

export default
class CacheableImage extends Component {
  static async globalCheckImageCache(imageUri, cachePath, cacheKey) {
      const dirPath = saveDocumentPath+'/'+cachePath;
      const filePath = dirPath+'/'+cacheKey;

      var res = await RNFS.exists(filePath);
      if (res) {
        return filePath;
      }else {
        return null;
      }
  }
  static async getFilepathFromSource(source, skipSourceCheck,cb) {
      if(source&&isLocalFile(source.uri)) return source.uri;
      if (source !== null
          && source != ''
          && typeof source === "object"
          && source.hasOwnProperty('uri')
          && (
              skipSourceCheck ||
              typeof skipSourceCheck === 'undefined' ||
              (!skipSourceCheck && source != this.props.source)
         )
      )
      {
          const url = new URL(source.uri, null, true);
          let cacheable = url.pathname;

          var type = url.pathname.replace(/.*\.(.*)/, '$1');
          if (url.href.indexOf('x-oss-process')&&url.pathname===type) {//oss update
            type='jpg';
            if (url.href.indexOf('format')>0) {
              type=url.href.substring(url.href.indexOf('format')+9,url.href.length);
            }
            if (url.href.indexOf('resize')<=0) {
              // console.warn('3333',url.href,cacheable,cacheKey,);
              cacheable+='origin';
            }
          }
          const cacheKey = SHA1(cacheable) + (type.length < url.pathname.length ? '.' + type : '');

          // console.warn('checkImageCache...',source);
          var path=await this.globalCheckImageCache(source.uri, url.host, cacheKey).then();
          // console.warn('path',source,path);

          return path;
      }
      else {
          return null;
      }
  }

    constructor(props) {
        super(props)
        this.imageDownloadBegin = this.imageDownloadBegin.bind(this);
        this.imageDownloadProgress = this.imageDownloadProgress.bind(this);
        this._handleConnectivityChange = this._handleConnectivityChange.bind(this);
        this._stopDownload = this._stopDownload.bind(this);

        this.state = {
            isRemote: false,
            cachedImagePath: null,
            cacheable: true
        };

        this.networkAvailable = props.networkAvailable;
        this.downloading = false;
        this.jobId = null;
    };

    componentWillReceiveProps(nextProps) {
        if (this.compareSource(nextProps)|| nextProps.networkAvailable != this.props.networkAvailable) {
            this.networkAvailable = nextProps.networkAvailable;
            this._processSource(nextProps.source);
        }
    }

    compareSource(nextProps) {
      if(nextProps.source&&this.props.source&&nextProps.source.uri === this.props.source.uri) return false;
      return nextProps.source != this.props.source;
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextState === this.state && nextProps === this.props) {
            return false;
        }
        return true;
    }

    async imageDownloadBegin(info) {
        switch (info.statusCode) {
            case 404:
            case 403:
                break;
            default:
                this.downloading = true;
                this.jobId = info.jobId;
        }
    }

    async imageDownloadProgress(info) {
        // console.warn(info,info.bytesWritten/info.contentLength);
        if ((info.contentLength / info.bytesWritten) == 1) {
            this.downloading = false;
            this.jobId = null;
        }
    }

    async checkImageCache(imageUri, cachePath, cacheKey) {
        const dirPath = saveDocumentPath+'/'+cachePath;
        const filePath = dirPath+'/'+cacheKey;
        var token = await storage.getToken();
        var jwtToken = await storage.getJwtToken();
        var deviceid=await storage.getDeviceId();
        // console.log('start check file path...',filePath);
        RNFS
        .exists(filePath)
        .then((res) => {
            if (res) {
              // console.warn('filePath exists...',filePath);
                // It's possible the component has already unmounted before setState could be called.
                // It happens when the defaultSource and source have both been cached.
                // An attempt is made to display the default however it's instantly removed since source is available

                    // console.warn('check Image is remote and has cacheable...',filePath);
                // means file exists, ie, cache-hit
                this.setState({cacheable: true, cachedImagePath: filePath});
              if(this.props.onLoad) this.props.onLoad();
            }
            else {
              throw Error("CacheableImage: Invalid file in checkImageCache()");
            }
        })
        .catch((err) => {
            // means file does not exist
            // first make sure network is available..
            // if (! this.state.networkAvailable) {
            if (! this.networkAvailable) {
                return;
            }

            // then make sure directory exists.. then begin download
            // The NSURLIsExcludedFromBackupKey property can be provided to set this attribute on iOS platforms.
            // Apple will reject apps for storing offline cache data that does not have this attribute.
            // https://github.com/johanneslumpe/react-native-fs#mkdirfilepath-string-options-mkdiroptions-promisevoid

            // console.warn('start check dir is exist',err);
            RNFS
            .mkdir(dirPath, {NSURLIsExcludedFromBackupKey: true})
            .then(() => {
                // console.warn('create dir is success');
                // before we change the cachedImagePath.. if the previous cachedImagePath was set.. remove it
                if (this.state.cacheable && this.state.cachedImagePath) {
                    let delImagePath = this.state.cachedImagePath;
                    // console.warn('delete file ...');
                    this._deleteFilePath(delImagePath);
                }

                // If already downloading, cancel the job
                if (this.jobId) {
                    // console.warn('If already downloading, cancel the job',this.jobId);
                    this._stopDownload();
                }
                var headers={};
                headers[TOKENHEADER]=token;
                headers[HEADERDEVICEID]=deviceid;
                headers[JWTTOKENHEADER]=jwtToken;
                let downloadOptions = {
                    fromUrl: imageUri,
                    toFile: filePath,
                    background: this.props.downloadInBackground,
                    begin: this.imageDownloadBegin,
                    progress: this.imageDownloadProgress,
                    headers
                };

                // directory exists.. begin download
                let download = RNFS
                .downloadFile(downloadOptions);
                this.downloading = true;
                this.jobId = download.jobId;
                // console.warn('start downloading...',this.jobId,imageUri);

                download.promise
                .then((res) => {
                    this.downloading = false;
                    this.jobId = null;
                    // console.log('end downloading...',res.statusCode);
                    switch (res.statusCode) {
                        case 404:
                        case 403:
                            this.setState({cacheable: false, cachedImagePath: null});
                            break;
                        default:
                          this.setState({cacheable: true, cachedImagePath: filePath});
                          if(this.props.onLoad) this.props.onLoad();
                    }
                })
                .catch((err) => {
                    // error occurred while downloading or download stopped.. remove file if created
                    this._deleteFilePath(filePath);
                    // console.warn('download error...');
                    // If there was no in-progress job, it may have been cancelled already (and this component may be unmounted)
                    if (this.downloading) {
                        // console.warn('stop downloading...',this.jobId);
                        this.downloading = false;
                        this.jobId = null;
                        this.setState({cacheable: false, cachedImagePath: null});
                    }
                });
            })
            .catch((err) => {
                // console.warn('CacheableImage: Invalid file in checkImageCache');
                this._deleteFilePath(filePath);
                this.setState({cacheable: false, cachedImagePath: null});
            });
        });
    }

    _deleteFilePath(filePath) {
        RNFS
        .exists(filePath)
        .then((res) => {
            if (res) {
                RNFS
                .unlink(filePath)
                .catch((err) => {console.warn('error _deleteFilePath...',err);});
            }
        });
    }

    _processSource(source, skipSourceCheck) {
        if(source&&isLocalFile(source.uri)){
          this.setState({isRemote: false});
          return;
        }
        if (source !== null
            && source != ''
            && typeof source === "object"
            && source.hasOwnProperty('uri')
            && (
                skipSourceCheck ||
                typeof skipSourceCheck === 'undefined' ||
                (!skipSourceCheck && source != this.props.source)
           )
        )
        { // remote

            if (this.jobId) { // sanity
                this._stopDownload();
            }

            const url = new URL(source.uri, null, true);

            // handle query params for cache key
            let cacheable = url.pathname;
            if (Array.isArray(this.props.useQueryParamsInCacheKey)) {
                this.props.useQueryParamsInCacheKey.forEach(function(k) {
                    if (url.query.hasOwnProperty(k)) {
                        cacheable = cacheable.concat(url.query[k]);
                    }
                });
            }
            else if (this.props.useQueryParamsInCacheKey) {
                cacheable = cacheable.concat(url.query);
            }

            var type = url.pathname.replace(/.*\.(.*)/, '$1');
            if (url.href.indexOf('x-oss-process')&&url.pathname===type) {//oss update
              type='bmp';
              if (url.href.indexOf('format')>0) {
                type=url.href.substring(url.href.indexOf('format')+9,url.href.length);
              }
              if (url.href.indexOf('resize')<=0) {
                // console.warn('3333',url.href,cacheable,cacheKey,);
                cacheable+='origin';
              }
            }
            const cacheKey = SHA1(cacheable) + (type.length < url.pathname.length ? '.' + type : '');

            this.checkImageCache(source.uri, url.host, cacheKey);
            this.setState({isRemote: true});
        }
        else {
            this.setState({isRemote: false});
        }
    }

    _stopDownload() {
        if (!this.jobId) return;
        // console.warn('_stopDownload...')
        this.downloading = false;
        RNFS.stopDownload(this.jobId);
        this.jobId = null;
    }

    componentWillMount() {
        if (this.props.checkNetwork) {
          // console.warn('start checkNetwork');
            this._netInfoEvent=NetInfo.addEventListener( this._handleConnectivityChange);
            // componentWillUnmount unsets this._handleConnectivityChange in case the component unmounts before this fetch resolves
            NetInfo.fetch().done(this._handleConnectivityChange);
        }

        this._processSource(this.props.source, true);
    }

    componentWillUnmount() {
      this.setState=()=>{};
        if (this.props.checkNetwork) {
            //NetInfo.removeEventListener('connectionChange', this._handleConnectivityChange);
          if(this._netInfoEvent){this._netInfoEvent()}
            this._handleConnectivityChange = null;
        }
        // console.warn('componentWillUnmount...',this.downloading,this.jobId);
        if (this.downloading && this.jobId) {
            this._stopDownload();
        }
    }

    async _handleConnectivityChange(isConnected) {
      // console.warn('_handleConnectivityChange...',isConnected);
        this.networkAvailable = isConnected;
    };

    render() {
      // console.warn('render CacheableImage...',this.state.isRemote,this.state.cacheable,!!this.state.cachedImagePath);
      if(!this.state.isRemote&&this.props.defaultSource&&isLocalFile(this.props.defaultSource.uri)){
        return this.renderDefaultSource(false);
      }
      if (!this.state.isRemote && !this.props.defaultSource) {
        return this.renderLocal();
      }

      if (this.state.cacheable && this.state.cachedImagePath) {
          return this.renderCache();
      }

      if (this.props.defaultSource) {
          return this.renderDefaultSource();
      }

      return (
          <Loading />
      );
    }

    renderCache() {
        const { children, defaultSource, checkNetwork, networkAvailable, downloadInBackground, activityIndicatorProps, ...props } = this.props;
        return (
            <ResponsiveImage {...props} source={{uri: 'file://'+this.state.cachedImagePath}}>
            {children}
            </ResponsiveImage>
        );
    }

    renderLocal() {
        const { children, defaultSource, checkNetwork, networkAvailable, downloadInBackground, activityIndicatorProps, ...props } = this.props;
        return (
            <ResponsiveImage {...props}>
            {children}
            </ResponsiveImage>
        );
    }

    renderDefaultSource(showLoading=true) {
        const { children, defaultSource, checkNetwork, networkAvailable,resizeMode, ...props } = this.props;
        return (
            <ResponsiveImage {...props} source={defaultSource} resizeMode={resizeMode}>
              {showLoading?<Loading />:null}
            </ResponsiveImage>
        );
    }
}

CacheableImage.propTypes = {
    activityIndicatorProps: PropTypes.object,
    defaultSource: Image.propTypes.source,
    source: Image.propTypes.source,
    resizeMode: PropTypes.string,
    useQueryParamsInCacheKey: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.array
    ]),
    checkNetwork: PropTypes.bool,
    networkAvailable: PropTypes.bool,
    downloadInBackground: PropTypes.bool,
};

// console.log(Platform);

CacheableImage.defaultProps = {
    style: { backgroundColor: 'transparent' },
    activityIndicatorProps: {
        style: { backgroundColor: 'transparent', flex: 1 }
    },
    resizeMode:'cover',
    useQueryParamsInCacheKey: false, // bc
    checkNetwork: true,
    networkAvailable: true,
    downloadInBackground: (Platform.OS === 'ios') ? false : true
};
