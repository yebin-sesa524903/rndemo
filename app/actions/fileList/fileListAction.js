export const Images_Get_Device_File_List_Request = 'Images_Get_Device_File_List_Request';
export const Images_Get_Device_File_List_Success = 'Images_Get_Device_File_List_Success';
export const Images_Get_Device_File_List_Error = 'Images_Get_Device_File_List_Error';

/**
 * 获取详情图片及文件信息
 * @param deviceId
 * @returns {function(*, *): *}
 */
export function getDeviceFileList(deviceId){
    return (dispatch) => {
        return dispatch({
            types: [Images_Get_Device_File_List_Request, Images_Get_Device_File_List_Success, Images_Get_Device_File_List_Error],
            url: `/lego-bff/bff/ledger/rest/getDeviceFileList`,
            body: {serviceId: deviceId}
        });
    }
}


export const FileList_Remove_FileWithId_Request = 'FileList_Remove_FileWithId_Request';
export const FileList_Remove_FileWithId_Success = 'FileList_Remove_FileWithId_Success';
export const FileList_Remove_FileWithId_Error = 'FileList_Remove_FileWithId_Error';

/**
 * 删除文件
 * @param id
 * @returns {function(*): *}
 */
export function fileListDelete(id) {
    return (dispatch) => {
        return dispatch({
            types: [FileList_Remove_FileWithId_Request, FileList_Remove_FileWithId_Success, FileList_Remove_FileWithId_Error],
            url: `/lego-bff/bff/ledger/rest/fileDelete`,
            body: {id: id}
        });
    }
}

export const FileList_Preview_Visible = 'FileList_Preview_Visible';

/**
 * 图片放大 设置图片预览可见不可见
 * @param visible
 * @returns {function(*): *}
 */
export function filePreviewVisible(visible){
    return (dispatch) => {
        return dispatch({
            type: FileList_Preview_Visible,
            data: visible,
        });
    }
}


export const FileList_Destroy_Clear = 'FileList_Destroy_Clear';

/**
 * 销毁操作
 * @returns {function(*): *}
 */
export function fileDestroyClear(){
    return (dispatch) => {
        return dispatch({
            type: FileList_Destroy_Clear,
        });
    }
}
