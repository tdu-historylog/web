import {Log, LogCampus} from '../@types/log';
import LogUtil from './LogUtil';
import {uniqueRoomNames} from './uniqueRoomNames';
import {TableData} from '../@types/historyTable';
import {formatDate} from '../utils/formatUtil';

export class LogConvert {
  private campus: LogCampus;
  private date: string;
  private label: string;
  private code: string;

  private logUtil: LogUtil;

  private buildingNumber: string;
  private floorNumber: string;
  private roomNumber: string;
  private seatNumber: string;

  constructor(log: Log) {
    this.code = log.code;
    this.date = log.date;
    this.campus = log.campus;
    this.label = log.label;

    this.logUtil = new LogUtil(this.code);
    if (this.isUseLog()) {
      const parseQrData = this.logUtil.parseQrData();

      this.buildingNumber = parseQrData.buildingNumber;
      this.floorNumber = parseQrData.floorNumber;
      this.roomNumber = parseQrData.roomNumber;
      this.seatNumber = parseQrData.seatNumber;
    }
  }

  /**
   * ログが使用可能かどうか
   */
  isUseLog() {
    return this.logUtil.validateQrData();
  }

  /**
   * 部屋番号
   * @returns room number
   */
  roomName() {
    if (this.roomNumber in uniqueRoomNames) {
      return uniqueRoomNames[this.roomNumber];
    }
    return `${this.roomNumber}教室`;
  }

  /**
   * ツイートテキスト
   * @param logLength ログの大きさ
   */
  tweetText(logLength: number) {
    return `I'm at ${this.roomName()}%0d%0d合計ログ数: ${logLength}%0d${this.additionalText(
      logLength
    )}%0d`;
  }

  /**
   * @returns 追加完了テキスト
   */
  successText() {
    return `${this.buildingNumber}号館 ${
      this.floorNumber
    }階 ${this.roomName()}`;
  }

  /**
   * 履歴確認テキスト
   */
  historyTableText(dateType: boolean): TableData {
    return {
      date: formatDate(this.date, dateType),
      building: parseInt(this.buildingNumber),
      floor: parseInt(this.floorNumber),
      room: this.roomName(),
      seat: this.seatNumber,
      campus: this.campus,
    };
  }

  private additionalText(logNumber: number): string {
    if (logNumber === 1) {
      return 'はじめてのログ！';
    }
    if (logNumber < 5) {
      return '頑張っている！';
    }
    if (logNumber < 10) {
      return '凄い！！！';
    }
    if (logNumber < 20) {
      return 'めっちゃ凄い！！！';
    }
    if (logNumber < 30) {
      return '実績を解除しました: 神';
    }
    if (logNumber < 40) {
      return '開発者もびっくり！';
    }
    return 'これ以上は定義してないので開発者に問い合わせてください…';
  }
}
