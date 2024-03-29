import _ from 'lodash'

let swal = null
if (document && document.head) {
  swal = require('sweetalert2').default
}

class Alerts {
  static confirmAlert ({ alertType = Alerts.alertType.info, title = '', text = '', confirmButtonText = 'OK', cancelButtonText = 'Cancel', onBeforeOpen, reverseButtons, allowOutsideClick = true, allowEscapeKey = true, callback, cancelCallback }) {
    Alerts.tryToLoadSwal()
    if (_.isNull(swal)) {
      if (_.isFunction(callback)) {
        callback(new Error('Unable to load swal'))
      }
    } else {
      swal.fire({
        title: title,
        html: text,
        icon: alertType,
        confirmButtonText,
        cancelButtonText,
        reverseButtons,
        willOpen: onBeforeOpen,
        allowOutsideClick,
        allowEscapeKey,
        showCancelButton: true
      }).then((result) => {
        if (result.value) {
          if (_.isFunction(callback)) {
            callback(null, result.value)
          }
        } else {
          if (_.isFunction(cancelCallback)) {
            cancelCallback(null)
          }
        }
      })
    }
  }

  static infoAlert ({ text = chrome.i18n.getMessage('expectedInfoMessageNotFound'), title = 'Info', callback }) {
    Alerts.tryToLoadSwal()
    if (_.isNull(swal)) {
      if (_.isFunction(callback)) {
        callback(new Error('Unable to load swal'))
      }
    } else {
      swal.fire({
        icon: Alerts.alertType.info,
        title: title,
        html: text
      })
    }
  }

  static updateableAlert ({ text = chrome.i18n.getMessage('expectedInfoMessageNotFound'), type = Alerts.alertType.info, title = 'Info', timerIntervalHandler = null, timerIntervalPeriodInSeconds = 0.1, allowOutsideClick = true, allowEscapeKey = true, callback }) {
    Alerts.tryToLoadSwal()
    if (_.isNull(swal)) {
      if (_.isFunction(callback)) {
        callback(new Error('Unable to load swal'))
      }
    } else {
      let fire = () => {
        let timerInterval
        swal.fire({
          icon: Alerts.alertType.info,
          title: title,
          html: text,
          allowOutsideClick,
          allowEscapeKey,
          showConfirmButton: true,
          didOpen: () => {
            if (_.isFunction(timerIntervalHandler)) {
              timerInterval = setInterval(() => {
                timerIntervalHandler(swal, timerInterval)
              }, timerIntervalPeriodInSeconds * 1000)
            }
          },
          didClose: () => {
            clearInterval(timerInterval)
          }
        })
      }
      if (Alerts.isVisible()) {
        Alerts.closeAlert()
        setTimeout(fire, 1000)
      } else {
        fire()
      }
    }
  }

  static errorAlert ({ text = chrome.i18n.getMessage('unexpectedError'), title = 'Oops...', callback, onClose }) {
    Alerts.tryToLoadSwal()
    if (_.isNull(swal)) {
      if (_.isFunction(callback)) {
        callback(new Error('Unable to load swal'))
      }
    } else {
      swal.fire({
        icon: Alerts.alertType.error,
        title: title,
        html: text
      }).then(() => {
        if (_.isFunction(callback)) {
          callback(null)
        }
      })
    }
  }

  static successAlert ({ text = 'Your process is correctly done', title = 'Great!', callback }) {
    Alerts.tryToLoadSwal()
    if (_.isNull(swal)) {
      if (_.isFunction(callback)) {
        callback(new Error('Unable to load swal'))
      }
    } else {
      swal.fire({
        icon: Alerts.alertType.success,
        title: title,
        html: text
      })
    }
  }

  static simpleSuccessAlert ({ text = 'Saved!', callback }) {
    Alerts.tryToLoadSwal()
    if (_.isNull(swal)) {
      if (_.isFunction(callback)) {
        callback(new Error('Unable to load swal'))
      }
    } else {
      swal.fire(text, '', 'success').then(() => {
        if (_.isFunction(callback)) {
          callback()
        }
      })
    }
  }

  static temporalAlert ({ text = 'It is done', title = 'Finished', type = Alerts.alertType.info, timer = 1500, position = 'top-end', callback }) {
    Alerts.tryToLoadSwal()
    if (_.isNull(swal)) {
      if (_.isFunction(callback)) {
        callback(new Error('Unable to load swal'))
      }
    } else {
      swal.fire({
        position: position,
        type: type,
        title: title, // TODO i18n
        html: text,
        showConfirmButton: false,
        timer: timer
      })
    }
  }

  static loadingAlert ({ text = 'If it takes too much time, please reload the page and try again.', position = 'top-end', title = 'Working on something, please be patient', confirmButton = false, timerIntervalHandler, callback }) {
    Alerts.tryToLoadSwal()
    if (_.isNull(swal)) {
      if (_.isFunction(callback)) {
        callback(new Error('Unable to load swal'))
      }
    } else {
      let timerInterval
      swal.fire({
        position: position,
        title: title,
        html: text,
        showConfirmButton: confirmButton,
        willOpen: () => {
          swal.showLoading()
          if (_.isFunction(timerIntervalHandler)) {
            timerInterval = setInterval(() => {
              if (swal.isVisible()) {
                timerIntervalHandler(swal)
              } else {
                clearInterval(timerInterval)
              }
            }, 100)
          }
        },
        didClose: () => {
          clearInterval(timerInterval)
        }
      })
    }
  }

  static inputTextAlert ({ title, input = 'text', type, inputPlaceholder = '', inputValue = '', preConfirm, cancelCallback, showCancelButton = true, html = '', allowOutsideClick = true, allowEscapeKey = true, callback }) {
    Alerts.tryToLoadSwal()
    if (_.isNull(swal)) {
      if (_.isFunction(callback)) {
        callback(new Error('Unable to load swal'))
      }
    } else {
      swal.fire({
        title: title,
        input: input,
        inputPlaceholder: inputPlaceholder,
        inputValue: inputValue,
        html: html,
        type: type,
        preConfirm: preConfirm,
        allowOutsideClick,
        allowEscapeKey,
        showCancelButton: showCancelButton
      }).then((result) => {
        if (result.value) {
          if (_.isFunction(callback)) {
            callback(null, result.value)
          }
        } else {
          if (_.isFunction(cancelCallback)) {
            cancelCallback()
          }
        }
      })
    }
  }

  static multipleInputAlert ({ title = 'Input', html = '', preConfirm, position = Alerts.position.center, onBeforeOpen, showCancelButton = true, allowOutsideClick = true, allowEscapeKey = true, callback, cancelCallback, customClass }) {
    Alerts.tryToLoadSwal()
    if (_.isNull(swal)) {
      if (_.isFunction(callback)) {
        callback(new Error('Unable to load swal'))
      }
    } else {
      swal.fire({
        title: title,
        html: html,
        focusConfirm: false,
        preConfirm: preConfirm,
        position: position,
        willOpen: onBeforeOpen,
        allowOutsideClick,
        allowEscapeKey,
        customClass: customClass,
        showCancelButton: showCancelButton
      }).then((result) => {
        if (result.value) {
          if (_.isFunction(callback)) {
            callback(null, result.value)
          }
        } else {
          if (_.isFunction(cancelCallback)) {
            cancelCallback(null)
          }
        }
      })
    }
  }

  static threeOptionsAlert ({ title = 'Input', html = '', preConfirm, preDeny, position = Alerts.position.center, onBeforeOpen, showDenyButton = true, showCancelButton = true, confirmButtonText = 'Confirm', confirmButtonColor = '#4BB543', denyButtonText = 'Deny', denyButtonColor = '#3085D6', cancelButtonText = 'Cancel', allowOutsideClick = true, allowEscapeKey = true, callback, denyCallback, cancelCallback, customClass }) {
    Alerts.tryToLoadSwal()
    if (_.isNull(swal)) {
      if (_.isFunction(callback)) {
        callback(new Error('Unable to load swal'))
      }
    } else {
      swal.fire({
        title: title,
        html: html,
        focusConfirm: false,
        preConfirm: preConfirm,
        preDeny: preDeny,
        position: position,
        willOpen: onBeforeOpen,
        allowOutsideClick,
        allowEscapeKey,
        customClass: customClass,
        showDenyButton: showDenyButton,
        showCancelButton: showCancelButton,
        confirmButtonText: confirmButtonText,
        confirmButtonColor: confirmButtonColor,
        denyButtonText: denyButtonText,
        denyButtonColor: denyButtonColor,
        cancelButtonText: cancelButtonText

      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          if (_.isFunction(callback)) {
            callback(null, result.value)
          }
        } else if (result.isDenied) {
          if (_.isFunction(callback)) {
            denyCallback(null, result.value)
          }
        } else {
          if (_.isFunction(cancelCallback)) {
            cancelCallback(null)
          }
        }
      })
    }
  }

  static twoOptionsAlert ({ title = 'Input', html = '', preConfirm, preDeny, position = Alerts.position.center, onBeforeOpen, showDenyButton = true, confirmButtonText = 'Confirm', confirmButtonColor = '#4BB543', denyButtonText = 'Deny', denyButtonColor = '#3085D6', allowOutsideClick = true, allowEscapeKey = true, callback, denyCallback }) {
    Alerts.tryToLoadSwal()
    if (_.isNull(swal)) {
      if (_.isFunction(callback)) {
        callback(new Error('Unable to load swal'))
      }
    } else {
      swal.fire({
        title: title,
        html: html,
        focusConfirm: false,
        preConfirm: preConfirm,
        preDeny: preDeny,
        position: position,
        willOpen: onBeforeOpen,
        allowOutsideClick,
        allowEscapeKey,
        showDenyButton: showDenyButton,
        confirmButtonText: confirmButtonText,
        confirmButtonColor: confirmButtonColor,
        denyButtonText: denyButtonText,
        denyButtonColor: denyButtonColor

      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          if (_.isFunction(callback)) {
            callback(null, result.value)
          }
        } else if (result.isDenied) {
          if (_.isFunction(callback)) {
            denyCallback(null, result.value)
          }
        }
      })
    }
  }

  static tryToLoadSwal () {
    if (_.isNull(swal)) {
      try {
        swal = require('sweetalert2').default
      } catch (e) {
        swal = null
      }
    }
  }

  static warningAlert ({ text = 'Something that you need to worry about happened. ' + chrome.i18n.getMessage('ContactAdministrator'), title = 'Warning', callback }) {
    Alerts.tryToLoadSwal()
    if (_.isNull(swal)) {
      if (_.isFunction(callback)) {
        callback(new Error('Unable to load swal'))
      }
    } else {
      swal.fire({
        type: Alerts.alertType.warning,
        title: title,
        html: text
      })
    }
  }

  static closeAlert () {
    swal.close()
  }

  static isVisible () {
    return swal.isVisible()
  }
}

Alerts.alertType = {
  warning: 'warning',
  error: 'error',
  success: 'success',
  info: 'info',
  question: 'question'
}

Alerts.position = {
  top: 'top',
  topStart: 'top-start',
  topEnd: 'top-end',
  center: 'center',
  centerStart: 'center-start',
  centerEnd: 'center-end',
  bottom: 'bottom',
  bottomStart: 'bottom-start',
  bottomEnd: 'bottom-end'
}

export default Alerts
