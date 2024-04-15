import {
    FileList_Destroy_Clear,
    FileList_Preview_Visible,
    FileList_Remove_FileWithId_Error,
    FileList_Remove_FileWithId_Request,
    FileList_Remove_FileWithId_Success,
    Images_Get_Device_File_List_Error,
    Images_Get_Device_File_List_Request,
    Images_Get_Device_File_List_Success
} from "../../actions/fileList/fileListAction";
import {RequestStatus} from "../../middleware/api";

const initialStatus = {
    images: [],
    fileListDeleteRequestStatus: RequestStatus.initial,
    previewVisible: {visible: false, index: 0},
}

export default function FileListReducer(state=initialStatus, action) {
    let nextStatus = Object.assign({}, state);
    switch (action.type) {
        case Images_Get_Device_File_List_Request:
            break;
        case Images_Get_Device_File_List_Success:
            nextStatus.images = action.response.imageList;
            break;
        case Images_Get_Device_File_List_Error:
            break;

        case FileList_Remove_FileWithId_Request:
            nextStatus.fileListDeleteRequestStatus = RequestStatus.loading;
            break;
        case FileList_Remove_FileWithId_Success:
            nextStatus.fileListDeleteRequestStatus = RequestStatus.success;
            break;
        case FileList_Remove_FileWithId_Error:
            nextStatus.fileListDeleteRequestStatus = RequestStatus.error;
            break

        case FileList_Preview_Visible:
            nextStatus.previewVisible = action.data;
            break;

        case FileList_Destroy_Clear:
            nextStatus.fileListDeleteRequestStatus = RequestStatus.initial;
            nextStatus.images = [];
            break;
    }
    return nextStatus || state;
}
