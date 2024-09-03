window.onload = function () {
  const canvas = document.getElementById("canvas");
  /** @type {CanvasRenderingContext2D} */
  const ctx = canvas.getContext("2d");
  const canvas2 = document.getElementById("canvas2");
  const ctx2 = canvas2.getContext("2d");
  const imageInput = document.getElementById("imageInput");

  canvas.width = 620;
  canvas.height = 400;
  canvas2.width = 620;
  canvas2.height = 400;

  let mockupImage = new Image();
  let userImage = new Image();

  // 목업 이미지 설정
  mockupImage.src = "assets/mock_labtop.png"; // 여기에 목업 이미지 경로를 설정
  mockupImage.width = 500;
  mockupImage.height = 350;
  mockupImage.onload = () => {
    canvas.width = mockupImage.width;
    canvas.height = mockupImage.height;
    ctx.drawImage(mockupImage, 0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
  };

  imageInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      userImage.src = e.target.result;
      userImage.onload = go;
      // userImage.onload = () => {
      //   // 사용자 이미지를 캔버스에 그리는 로직
      //   // 이 부분에서 이미지 변형 및 위치 조정이 필요
      // };
    };

    reader.readAsDataURL(file);
  });

  // 사용자 이미지를 변형시키고 목업의 꼭지점에 맞게 조정하는 함수
  // 이 함수는 사용자 인터페이스를 통해 제공되는 좌표에 따라 이미지를 변형해야 합니다.
  function transformAndPlaceImage() {
    // 사용자가 제공한 4개의 꼭지점에 맞게 이미지를 변형하고 렌더링
    // 이 부분은 고급 캔버스 변형 로직을 필요로 합니다.
  }

  /* Quadrilateral Transform - (c) Ken Nilsen, CC3.0-Attr */
  // userImage.src = "https://i.imgur.com/EWoZkZm.jpg";

  function go() {
    let me = this,
      stepEl = document.querySelector("input"),
      stepTxt = document.querySelector("span"),
      c = canvas2,
      ctx = ctx2,
      corners = [
        { x: 100, y: 20 }, // ul
        { x: 520, y: 20 }, // ur
        { x: 520, y: 380 }, // br
        { x: 100, y: 380 }, // bl
      ],
      radius = 10,
      cPoint,
      timer, // for mouse handling
      step = 4; // resolution

    update();

    // render image to quad using current settings
    function render() {
      let p1,
        p2,
        p3,
        p4,
        y1c,
        y2c,
        y1n,
        y2n,
        w = userImage.width - 1, // -1 to give room for the "next" points
        h = userImage.height - 1;

      ctx.clearRect(0, 0, c.width, c.height);

      for (y = 0; y < h; y += step) {
        for (x = 0; x < w; x += step) {
          y1c = lerp(corners[0], corners[3], y / h);
          y2c = lerp(corners[1], corners[2], y / h);
          y1n = lerp(corners[0], corners[3], (y + step) / h);
          y2n = lerp(corners[1], corners[2], (y + step) / h);

          // corners of the new sub-divided cell p1 (ul) -> p2 (ur) -> p3 (br) -> p4 (bl)
          p1 = lerp(y1c, y2c, x / w);
          p2 = lerp(y1c, y2c, (x + step) / w);
          p3 = lerp(y1n, y2n, (x + step) / w);
          p4 = lerp(y1n, y2n, x / w);

          ctx.drawImage(
            userImage,
            x,
            y,
            step,
            step,
            p1.x,
            p1.y, // get most coverage for w/h:
            Math.ceil(
              Math.max(step, Math.abs(p2.x - p1.x), Math.abs(p4.x - p3.x))
            ) + 1,
            Math.ceil(
              Math.max(step, Math.abs(p1.y - p4.y), Math.abs(p2.y - p3.y))
            ) + 1
          );
        }
      }
    }

    function lerp(p1, p2, t) {
      return {
        x: p1.x + (p2.x - p1.x) * t,
        y: p1.y + (p2.y - p1.y) * t,
      };
    }

    /* Stuff for demo: -----------------*/
    function drawCorners() {
      ctx.strokeStyle = "#09f";
      ctx.lineWidth = 2;
      ctx.beginPath();
      // border
      for (var i = 0, p; (p = corners[i++]); )
        ctx[i ? "lineTo" : "moveTo"](p.x, p.y);
      ctx.closePath();
      // circular handles
      for (i = 0; (p = corners[i++]); ) {
        ctx.moveTo(p.x + radius, p.y);
        ctx.arc(p.x, p.y, radius, 0, 6.28);
      }
      ctx.stroke();
    }

    function getXY(e) {
      var r = c.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    function inCircle(p, pos) {
      var dx = pos.x - p.x,
        dy = pos.y - p.y;
      return dx * dx + dy * dy <= radius * radius;
    }

    // handle mouse
    c.onmousedown = function (e) {
      var pos = getXY(e);
      for (var i = 0, p; (p = corners[i++]); ) {
        if (inCircle(p, pos)) {
          cPoint = p;
          break;
        }
      }
    };
    window.onmousemove = function (e) {
      if (cPoint) {
        var pos = getXY(e);
        cPoint.x = pos.x;
        cPoint.y = pos.y;
        cancelAnimationFrame(timer);
        timer = requestAnimationFrame(update.bind(me));
      }
    };
    window.onmouseup = function () {
      cPoint = null;
    };

    stepEl.oninput = function () {
      stepTxt.innerHTML = step = Math.pow(2, +this.value);
      update();
    };

    function update() {
      render();
      drawCorners();
    }
  }
};
