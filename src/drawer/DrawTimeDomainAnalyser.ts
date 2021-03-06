import AvesAnalyser from '../aves/AvesAnalyser'
import * as util from '../util'
export default class {
  private _canvasWidth: number
  private _canvasHeight: number
  private _canvasElm: HTMLCanvasElement
  private _ctx: CanvasRenderingContext2D
  private _animationFrameId: number
  private _bgColor: string
  private gridStyle: string = util.createColor(230, 230, 230, 0.5)
  private scaleStyle: string = util.createColor(250, 250, 250, 1)
  private _dispHz: number[] = [30, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 15000]
  private _dispDecibel: number[] = [0, -10, -20, -30, -40, -50, -60, -70, -80, -90]

  constructor(elm: HTMLCanvasElement, canvasWidth: number, canvasHeight: number) {
    this._canvasElm = elm

    this._canvasElm.width = this._canvasWidth = canvasWidth
    this._canvasElm.height = this._canvasHeight = canvasHeight

    this._ctx = this._canvasElm.getContext('2d')

    this._bgColor = util.createColor(46, 40, 48)

    this._ctx.clearRect(0, 0, this._canvasWidth, this._canvasHeight)
    this._ctx.fillStyle = this._bgColor
    this._ctx.fillRect(0, 0, this._canvasWidth, this._canvasHeight)
  }

  /**
   * 特定のHzをX軸のどの部分に対数表示をすればいいかを
   * 計算する。
   * @param {number} hz
   * @param {number} minHz
   * @param {number} maxHz
   * @returns {number} 横軸の画面位置
   */
  pointX(hz: number, minHz: number, maxHz: number): number {
    return (
      ((util.seekDigit(hz) - util.seekDigit(minHz)) / (util.seekDigit(maxHz) - util.seekDigit(minHz))) *
      this._canvasWidth
    )
  }

  /**
   * 描画メソッド
   * @param {AvesAnalyser} avesAnalyser
   */
  draw(avesAnalyser: AvesAnalyser) {
    // ─────────────────────────────────────────────────────────────────
    // 初期化処理
    // ─────────────────────────────────────────────────────────────────
    const arrayLength: number = avesAnalyser.byteTimeDomainArray.length
    this._ctx.beginPath()
    const fontSize = 11
    this._ctx.font = util.createFont(String(fontSize) + 'px')
    this._ctx.fillStyle = this._bgColor
    this._ctx.fillRect(0, 0, this._canvasWidth, this._canvasHeight)

    // ─────────────────────────────────────────────────────────────────
    // デフォルトでは2048までループ
    // ─────────────────────────────────────────────────────────────────
    for (let i = 0; i <= arrayLength; i++) {
      // ─────────────────────────────────────────────────────────────────
      // プロットする点を得る処理
      // ─────────────────────────────────────────────────────────────────
      const pointX = (i / arrayLength) * this._canvasWidth
      // ─────────────────────────────────────────────────────────────────
      // avesAnalyser.byteTimeDomainArrayの中身の数値は0~255
      // ─────────────────────────────────────────────────────────────────
      const pointY = (1 - avesAnalyser.byteTimeDomainArray[i] / 255) * this._canvasHeight
      if (i === 0) {
        this._ctx.moveTo(0, pointY)
      } else {
        this._ctx.lineTo(pointX, pointY)
      }

      // ─────────────────────────────────────────────────────────────────
      // X軸に目盛りを描画
      // ─────────────────────────────────────────────────────────────────
      const sec = i * avesAnalyser.samplingInterval()
      const msec = sec * Math.pow(10, 3)
      if (msec % 5 === 0) {
        var text = Math.round(msec) + ' msec'
        this._ctx.fillStyle = this.gridStyle
        this._ctx.fillRect(pointX, 0, 1, this._canvasHeight)
        this._ctx.fillStyle = this.scaleStyle
        this._ctx.fillText(text, pointX + 4, this._canvasHeight - fontSize)
      }
    }

    // ─────────────────────────────────────────────────────────────────
    // グラフを描画
    // ─────────────────────────────────────────────────────────────────
    this._ctx.strokeStyle = util.createColor(250, 250, 250, 1)
    this._ctx.lineWidth = 1
    this._ctx.stroke()

    // ─────────────────────────────────────────────────────────────────
    // Y軸に目盛りを描画
    // ─────────────────────────────────────────────────────────────────
    var textYs = ['1.00', '0.00', '-1.00']
    for (var i = 0, len = textYs.length; i < len; i++) {
      var text = textYs[i]
      var gy = ((1 - parseFloat(text)) / 2) * this._canvasHeight
      this._ctx.fillStyle = this.gridStyle
      this._ctx.fillRect(0, gy, this._canvasWidth, 1)
      this._ctx.fillStyle = this.scaleStyle
      this._ctx.fillText(text, 5, gy + 12)
    }
  }

  /**
   *
   *
   * @param {AvesAnalyser} avesAnalyser
   * requestAnimationFrameで自分自身を呼ぶ
   */
  animationStart(avesAnalyser: AvesAnalyser) {
    avesAnalyser.getByteTimeDomainData()
    this.draw(avesAnalyser)

    this._animationFrameId = requestAnimationFrame(() => this.animationStart(avesAnalyser))
  }

  animationStop() {
    cancelAnimationFrame(this._animationFrameId)
  }
}
