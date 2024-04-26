import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Table, TableWrapper } from "../table/table";
import { Row, Rows } from "../table/rows";
import Colors from "../../../../utils/const/Colors";
import { LinearGradientHeader } from "../LinearGradientHeader";
import { Col, Cols } from "../table/cols";
import { screenWidth } from "../../../../utils/const/Consts";

export interface GasTableProps {
  title?: string,
  headers?: string[],///表头数据集合
  rows?: string[][],///表内容数据集合
  ///以下属性 适用于合并table item展示
  leftRow?: { title: string, count: number }[],  ///左边数据集合 {标题, 这个标题占据几行}
  rightRow?: string[][],  ///右侧展示数据集合
}

export function GasTableItem(props: GasTableProps) {
  return (
    <LinearGradientHeader title={props.title}
      content={
        GasTable(props.headers??[], props.rows, props.leftRow, props.rightRow)
      } />
  )
}


function GasTable(headers: string[], rows?: string[][], leftRow?: { title: string, count: number }[], rightRow?: string[][]) {
  /**
   * 解决 table 头  上面文字大 下面文字小
   */
  const renderHeaders=() => {
    return headers.map((value, index, array) => {
      let text=value.split('\n');
      let title=text.shift();
      let subTitle=text.pop();
      return (
        <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.headerText}>{title}</Text>
          {
            !subTitle? null:
              <Text style={{ fontSize: 12, color: Colors.text.sub }}>{subTitle}</Text>
          }
        </View>
      )
    })
  }

  const renderTableContent=() => {
    let borderStyle={ borderWidth: 1, borderColor: '#F2EFEF' };
    if (leftRow&&rightRow) {
      let rowHeight=40;
      let leftData=[];
      let leftHeightArr=[];
      let rightHeightArr=[];
      let rightWidthArr=[];
      for (let left of leftRow) {
        leftData.push(left.title);
        leftHeightArr.push(rowHeight*left.count)
      }

      let widthItem=(screenWidth()-15*2-10*2)/headers.length
      for (let rowItem of rightRow) {
        rightWidthArr.push(widthItem);
      }
      if (rightRow.length>0) {
        for (let rowItem of rightRow[0]) {
          rightHeightArr.push(rowHeight)
        }
      }

      return (
        <Table borderStyle={borderStyle}>
          <Row data={renderHeaders()} style={styles.head} />
          <TableWrapper style={{ flexDirection: 'row' }}>
            <TableWrapper style={{ flex: 1 }}>
              <Col data={leftData}
                style={{ justifyContent: 'center', alignItems: 'center', }}
                heightArr={leftHeightArr}
                width={'100%'}
                textStyle={styles.rowText} />
            </TableWrapper>

            <TableWrapper style={{ flex: headers.length-1, }}>
              <Cols data={rightRow}
                style={{ justifyContent: 'center', alignItems: 'center' }}
                heightArr={rightHeightArr}
                widthArr={rightWidthArr}
                textStyle={styles.rowText} />
            </TableWrapper>
          </TableWrapper>
        </Table>
      )
    }
    if (rows) {
      return (
        <Table borderStyle={borderStyle}>
          <Row data={renderHeaders()} style={styles.head} />
          <Rows data={rows} textStyle={styles.rowText} style={styles.row} />
        </Table>
      )
    }
  }

  return (
    <View style={styles.container}>
      {renderTableContent()}
    </View>
  )
}


const styles=StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#fff' },
  head: { height: 56, backgroundColor: '#DDE5FF' },
  row: { height: 40, borderColor: '#F2EFEF' },
  rowText: {
    color: Colors.text.sub,
    fontSize: 13,
    textAlign: 'center'
  },
  headerText: {
    color: Colors.text.primary,
    fontSize: 13,
    textAlign: 'center',
    fontWeight: 'bold'
  },
});
