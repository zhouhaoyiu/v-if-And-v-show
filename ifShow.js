class IfShow {

  // 1.代理数据,数据劫持
  // 2.初始化dom
  /**
   * showPool [
   *   [
   *     dom,
   *     {
   *       type: if /show
   *       show: true / false
   *       data: 绑定数据
   *     }
   *   ]
   * ]
   * eventPool [
   *   [ 
   *     dom,
   *     handler
   *   ] 
   * 
   * ]
   */

  // 3.初始化视图
  // 4.eventPool 绑定事件处理函数
  constructor(options) {
    const { el, data, methods } = options;

    this.el = document.querySelector(el);
    this.data = data;
    this.methods = methods;
    this.showPool = new Map();
    this.eventPool = new Map();

    this.init()
  }

  init() {
    this.initData()
    this.initDom(this.el)
    this.initView(this.showPool)
    this.initEvent(this.eventPool)

    // console.log(this.showPool)
    // console.log(this.eventPool)
  }

  initData() {
    for (let key in this.data) {
      // this.boxShow1 -> this.data.boxShow1
      Object.defineProperty(this, key, {
        get() {
          return this.data[key]
        },
        set(newVal) {
          this.data[key] = newVal;
          this.domChange(key, this.showPool)
        }
      })
    }
    // console.log(this)
  }

  initDom(el) {
    // console.log(el)
    const _childNodes = el.childNodes;

    if (!_childNodes.length) {
      return;
    }
    _childNodes.forEach(dom => {
      if (dom.nodeType === 1) {
        const vIf = dom.getAttribute('v-if');
        const vShow = dom.getAttribute('v-show');
        const vEvent = dom.getAttribute('@click');

        if (vIf) {
          this.showPool.set(dom, {
            type: 'if',
            show: this.data[vIf],
            data: vIf
          })
        }
        else if (vShow) {
          this.showPool.set(dom, {
            type: 'show',
            show: this.data[vShow],
            data: vShow
          })
        }
        if (vEvent) {
          this.eventPool.set(dom, this.methods[vEvent])
        }
      }
      this.initDom(dom)
    })
  }

  initView(showPool) {
    this.domChange(null, showPool)
  }

  domChange(data, showPool) {
    // console.log(data)
    if (!data) {
      for (let [k, v] of showPool) {
        console.log(k.parentNode)
        switch (v.type) {
          case 'if':
            v.comment = document.createComment(`v-if`);
            !v.show && k.parentNode.replaceChild(v.comment, k);
            break;
          case 'show':
            !v.show && (k.style.display = 'none')
            break;
          default:
            break;
        }
      }
      return;
    }
    // console.log(showPool)
    for (let [k, v] of showPool) {
      if (v.data === data) {
        // console.log(data)
        // console.log(v.type)
        switch (v.type) {
          case 'if':
            v.show ? k.parentNode.replaceChild(v.comment, k) : v.comment.parentNode.replaceChild(k, v.comment);
            v.show = this[data];
            break;
          case 'show':
            v.show ? (k.style.display = 'none') : (k.style.display = 'block');
            v.show = this[data];
            break;
          default:
            break;
        }

      }
    }
  }

  initEvent(eventPool) {
    // console.log(eventPool)
    for (let [k, v] of eventPool) {
      // console.log(k, v)
      k.addEventListener('click', v.bind(this), false)
    }
  }
}