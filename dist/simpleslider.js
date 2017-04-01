(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.simpleslider = mod.exports;
  }
})(this, function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  function getdef(val, def) {
    return val == null ? def : val;
  }

  function startSlides(containerElem, unit, startVal, visVal, trProp) {
    var imgs = [];
    var i = containerElem.children.length;
    var style = void 0;

    while (--i >= 0) {
      imgs[i] = containerElem.children[i];
      style = imgs[i].style;
      style.position = 'absolute';
      style.top = style.left = style.zIndex = 0;
      style[trProp] = startVal + unit;
    }

    imgs[0].style[trProp] = visVal + unit;
    imgs[0].style.zIndex = 1;

    return imgs;
  }

  function manageSlideOrder(oldSlide, oldSlidePos, newSlide, newSlidePos) {
    newSlide.style.zIndex = newSlidePos;

    if (oldSlide) {
      oldSlide.style.zIndex = oldSlidePos;
    }

    return newSlide;
  }

  function getSlider(containerElem, options) {
    options = options || {};
    var actualIndex = void 0,
        hasVisibilityHandler = void 0,
        inserted = void 0,
        interval = void 0,
        intervalStartTime = void 0,
        imgs = void 0,
        remainingTime = void 0,
        removed = void 0;
    var width = parseInt(containerElem.style.width);

    var trProp = getdef(options.transitionProperty, 'left');
    var trTime = getdef(options.transitionDuration, 0.5);
    var delay = getdef(options.transitionDelay, 3) * 1000;
    var unit = getdef(options.unit, 'px');
    var startVal = parseInt(getdef(options.startValue, -width + unit));
    var visVal = parseInt(getdef(options.visibleValue, '0' + unit));
    var endVal = parseInt(getdef(options.endValue, width + unit));
    var paused = options.paused;
    var ease = getdef(options.ease, getSlider.defaultEase);
    var onChange = getdef(options.onChange, null);
    var onChangeEnd = getdef(options.onChangeEnd, null);

    function reset() {
      if (containerElem.children.length <= 0) {
        return;
      }

      var style = containerElem.style;
      style.position = 'relative';
      style.overflow = 'hidden';
      style.display = 'block';

      imgs = startSlides(containerElem, unit, startVal, visVal, trProp);
      actualIndex = 0;
      inserted = removed = null;
      remainingTime = delay;
    }

    function startInterval() {
      if (isAutoPlay()) {
        if (interval) {
          clearTimeout(interval);
        }

        (function setAutoPlayLoop() {
          intervalStartTime = Date.now();
          interval = setTimeout(function () {
            intervalStartTime = Date.now();
            remainingTime = delay;

            change(nextIndex());

            setAutoPlayLoop();
          }, remainingTime);
        })();

        if (!hasVisibilityHandler) {
          document.addEventListener('visibilitychange', function () {
            return document.hidden ? pause() : reset();
          }, false);

          hasVisibilityHandler = 1;
        }
      }
    }

    function isAutoPlay() {
      return !paused && imgs.length > 1;
    }

    function pause() {
      if (isAutoPlay()) {
        remainingTime = delay - (Date.now() - intervalStartTime);
        clearTimeout(interval);
        interval = null;
      }
    }

    function resume() {
      startInterval();
    }

    function change(newIndex) {
      var prevIndex = actualIndex;

      anim([{
        elem: manageSlideOrder(removed, 1, imgs[actualIndex], 3).style,
        from: visVal,
        to: endVal
      }, {
        elem: manageSlideOrder(inserted, 2, imgs[newIndex], 4).style,
        from: startVal,
        to: visVal
      }], trTime * 1000, 0, 0, ease);

      actualIndex = newIndex;

      if (onChange) {
        onChange(prevIndex, actualIndex);
      }
    }

    function next() {
      change(nextIndex());
      startInterval();
    }

    function prev() {
      change(prevIndex());
      startInterval();
    }

    function nextIndex() {
      var newIndex = actualIndex + 1;

      if (newIndex >= imgs.length) {
        newIndex = 0;
      }

      return newIndex;
    }

    function prevIndex() {
      var newIndex = actualIndex - 1;

      if (newIndex < 0) {
        newIndex = imgs.length - 1;
      }

      return newIndex;
    }

    function dispose() {
      clearTimeout(interval);

      imgs = containerElem = interval = trProp = trTime = delay = startVal = endVal = paused = actualIndex = inserted = removed = remainingTime = onChange = onChangeEnd = null;
    }

    function currentIndex() {
      return actualIndex;
    }

    function anim(targets, transitionDuration, startTime, elapsedTime, easeFunc) {
      var count = targets.length;

      while (--count >= 0) {
        var target = targets[count];
        var newValue = void 0;
        if (startTime > 0) {
          newValue = easeFunc(elapsedTime - startTime, target.from, target.to - target.from, transitionDuration);

          if (elapsedTime - startTime < transitionDuration) {
            target.elem[trProp] = newValue + unit;
          } else {
            count = targets.length;
            while (--count >= 0) {
              target = targets[count];
              target.elem[trProp] = target.to + unit;
            }

            if (onChangeEnd) {
              onChangeEnd(actualIndex, nextIndex());
            }
            return;
          }
        }
      }

      requestAnimationFrame(function (time) {
        if (startTime === 0) {
          startTime = time;
        }

        anim(targets, transitionDuration, startTime, time, easeFunc);
      });
    }

    reset();

    if (imgs) {
      startInterval();
    }

    return {
      currentIndex: currentIndex,
      isAutoPlay: isAutoPlay,
      pause: pause,
      resume: resume,
      nextIndex: nextIndex,
      prevIndex: prevIndex,
      next: next,
      prev: prev,
      change: change,
      dispose: dispose
    };
  }

  getSlider.defaultEase = function (time, begin, change, duration) {
    return (time = time / (duration / 2)) < 1 ? change / 2 * time * time * time + begin : change / 2 * ((time -= 2) * time * time + 2) + begin;
  };

  getSlider.easeNone = function (time, begin, change, duration) {
    return change * time / duration + begin;
  };

  exports.default = getSlider;
});