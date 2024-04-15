import {findDepartmentNameWithId} from "../../callTicket/detail/CallInHelper";


export enum KnowledgeItemType {
  basicMsg = 2209,   ///基本信息
  file,///附加信息
}

export function getKnowledgeDataInfo(detail: any, departments: any[]) {
  return [
    {
      icon: require('../../../../../images/aaxiot/airBottle/basic_msg.png'),
      title: '基本信息',
      isExpand: true,
      sectionType: KnowledgeItemType.basicMsg,
      data: [
        {
          title: '知识标题',
          subTitle: detail.title,
        },
        {
          title: '库类别',
          subTitle: detail.knowlTypeName,
        },
        {
          title: '类别',
          subTitle: detail.knowlTypeChildName
        },
        {
          title: '专业',
          subTitle: detail.specialty,
        },
        {
          title: '创建人',
          subTitle: detail.personName
        },
        {
          title: '课室',
          subTitle: findDepartmentNameWithId(detail.orgId, departments),
        },
        {
          title: '关键字',
          subTitle: detail.keywords,
        },
        {
          title: '摘要',
          subTitle: detail.digest,
          showSeeMore: true,  ///需要展示 查看更多
        },
        {
          title: '知识内容',
          subTitle: detail.content,
          showSeeMore: true,  ///需要展示 查看更多
        }
      ],
    },
    {
      title: '上传附件',
      icon: require('../../../../../images/aaxiot/callin/file_upload.png'),
      canEdit: false,
      sectionType: KnowledgeItemType.file,
      files: detail.files
    }
  ]
}
