/**
 * ============================================================================
 * DỰ ÁN WEB TƯƠNG TÁC CHÚC MỪNG NGÀY PHỤ NỮ VIỆT NAM 20/10
 * Kiến trúc: Modular Pattern (Config -> State -> UI Module -> Logic Controllers)
 * ============================================================================
 */

/* ============================================================================
   1. CONFIGURATION (CẤU HÌNH NỘI DUNG TẠI ĐÂY)
   Bạn chỉ cần thay đổi lời chúc, link nhạc và danh sách ảnh ở object APP_CONFIG
   ============================================================================ */
const APP_CONFIG = {
  // 1.1. Cấu hình Lời chúc 20/10 (Hiệu ứng Typewriter)
  greeting: {
    message:
      'Chúc mừng 20/10 người chơi hệ "Nhân Văn" đỉnh nhất vũ trụ! 🌸 Chúc em lúc nào cũng xinh xịn mịn, rạng rỡ như hoa ban mai và "slay" trong mọi khoảnh khắc. Mong em luôn giữ được nụ cười ngập tràn năng lượng, cuộc sống lúc nào cũng chill chill, bình an và nhận được vô vàn sự yêu thương trọn vẹn nhất!.\n\nCảm ơn em vì đã luôn dịu dàng, siêu kiên cường và mang đến cả một "vibe" siêu ấm áp cho thế giới này (và đặc biệt là cho anh). Vũ trụ này có 8 tỷ người nhưng em vẫn là "ngoại lệ" duy nhất cân trọn mọi cảm xúc của anh.\n\nMong rằng mỗi ngày trôi qua với em đều là một ngày ngọt ngào, không có deadline nào có thể làm em bận lòng và lúc nào cũng có anh ở đây để va chạm với mọi nỗi buồn cùng em! 💕,\n\nBắn tim x1000000 và gửi em cả đại dương tình yêu chân thành nhất! 💖✨.',
    signature: 'Thương gửi Nàng Nhân Văn Của Anh ngàn lời chúc tốt đẹp nhất ♥',
    typingSpeedMs: 38, // Tốc độ gõ chữ (ms/ký tự)
  },

  // 1.2. Cấu hình Nhạc nền (Thay bằng file .mp3 của bạn hoặc link trực tuyến)
  audio: {
    src: '/audio/nhac.mp3', // Đường dẫn nội bộ cực kỳ an toàn
    volume: 0.65,
    },

  // 1.3. Cấu hình Ảnh trong Carousel (3 - 4 bức ảnh kỷ niệm)
  gallery: [
  {
    url: './images/anh1.jpg', // Đường dẫn tới ảnh trong máy
    alt: 'Ảnh kỷ niệm 1',
    caption: 'Luôn rạng rỡ và tỏa hương như những đóa hoa tươi thắm 🌸',
  },
  {
    url: './images/anh2.jpg',
    alt: 'Ảnh kỷ niệm 2',
    caption: 'Mỗi ngày trôi qua đều ngập tràn niềm vui và tiếng cười ✨',
  },
  {
    url: './images/anh3.jpg',
    alt: 'Ảnh kỷ niệm 3',
    caption: 'Dịu dàng, tự tin và luôn là phiên bản hạnh phúc nhất 💖',
  },
],

  // 1.4. Cấu hình Tương tác Phase 1 & Slider Phase 2
  interaction: {
    stepPerClick: 10, // % tăng mỗi lần click
    holdIntervalMs: 85, // Tốc độ cộng % khi nhấn giữ (ms)
    stepPerHoldTick: 4, // % tăng mỗi nhịp khi nhấn giữ
    carouselIntervalMs: 3000, // Tự động chuyển ảnh sau mỗi 3 giây
  },
};

/* ============================================================================
   2. APPLICATION STATE (QUẢN LÝ TRẠNG THÁI)
   ============================================================================ */
const AppState = {
  progress: 0,
  isRevealed: false,
  holdTimerId: null,
  shakeTimeoutId: null,
  currentSlideIndex: 0,
  carouselTimerId: null,
  isAudioMuted: false,
};

/* ============================================================================
   3. DOM ELEMENTS & UI MODULE (XỬ LÝ GIAO DIỆN)
   Phân tách hoàn toàn thao tác DOM khỏi luồng xử lý logic
   ============================================================================ */
const DOM = {
  appRoot: document.querySelector('#app-root'),
  starCanvas: document.querySelector('#starfield-canvas'),
  phaseHook: document.querySelector('#phase-hook'),
  phaseReveal: document.querySelector('#phase-reveal'),
  giftBox: document.querySelector('#gift-box'),
  progressText: document.querySelector('#progress-text'),
  progressTrack: document.querySelector('#progress-track'),
  heartBtn: document.querySelector('#heart-btn'),
  typewriterText: document.querySelector('#typewriter-text'),
  typewriterCursor: document.querySelector('#typewriter-cursor'),
  cardSignature: document.querySelector('#card-signature'),
  carousel: document.querySelector('#image-carousel'),
  carouselTrack: document.querySelector('#carousel-track'),
  carouselPrevBtn: document.querySelector('#carousel-prev'),
  carouselNextBtn: document.querySelector('#carousel-next'),
  carouselDots: document.querySelector('#carousel-dots'),
  bgMusic: document.querySelector('#bg-music'),
  audioToggleBtn: document.querySelector('#audio-toggle-btn'),
  audioIcon: document.querySelector('#audio-icon'),
};

const UIController = {
  /**
   * Cập nhật thanh Progress Bar và cường độ rung của hộp quà bằng CSS Variables
   * @param {number} percent - Giá trị từ 0 đến 100
   */
  updateProgressUI(percent) {
    const ratio = percent / 100;
    const shakePx = (2 + ratio * 10).toFixed(1);
    const shakeDeg = (1.5 + ratio * 7).toFixed(1);

    DOM.appRoot.style.setProperty('--progress-ratio', ratio.toFixed(3));
    DOM.appRoot.style.setProperty('--shake-offset', `${shakePx}px`);
    DOM.appRoot.style.setProperty('--shake-rotate', `${shakeDeg}deg`);

    DOM.progressText.textContent = `${Math.round(percent)}%`;
    DOM.progressTrack.setAttribute('aria-valuenow', Math.round(percent));
  },

  /**
   * Kích hoạt hiệu ứng đập của nút Heart và rung hộp quà
   */
  triggerPulseAndShake() {
    // Hiệu ứng đập nút Heart
    DOM.heartBtn.classList.remove('hook__heart-btn--pulsing');
    void DOM.heartBtn.offsetWidth; // Trigger reflow nhẹ chỉ trên nút để restart animation
    DOM.heartBtn.classList.add('hook__heart-btn--pulsing');

    // Hiệu ứng rung hộp quà
    DOM.giftBox.classList.add('hook__gift-box--shaking');
    clearTimeout(AppState.shakeTimeoutId);
    AppState.shakeTimeoutId = setTimeout(() => {
      DOM.giftBox.classList.remove('hook__gift-box--shaking');
    }, 260);
  },

  /**
   * Chuyển cảnh mượt mà từ Phase 1 sang Phase 2
   */
  transitionToRevealPhase(onTransitionComplete) {
    DOM.phaseHook.classList.add('hook--hidden');
    DOM.appRoot.classList.add('app--phase-reveal');

    DOM.phaseReveal.classList.add('reveal--visible');
    DOM.phaseReveal.setAttribute('aria-hidden', 'false');

    // Đợi trình duyệt paint display:block rồi mới kích hoạt opacity/transform
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        DOM.phaseReveal.classList.add('reveal--active');
      });
    });

    setTimeout(() => {
      DOM.phaseHook.style.display = 'none';
      if (typeof onTransitionComplete === 'function') {
        onTransitionComplete();
      }
    }, 650);
  },

  /**
   * Khởi tạo DOM cho Image Carousel từ APP_CONFIG.gallery
   */
  renderCarousel(slidesData) {
    const slidesHTML = slidesData
      .map(
        (item, index) => `
        <div class="carousel__slide ${index === 0 ? 'carousel__slide--active' : ''}" role="group" aria-roledescription="slide" aria-label="${index + 1} / ${slidesData.length}">
          <img class="carousel__image" src="${item.url}" alt="${item.alt}" loading="${index === 0 ? 'eager' : 'lazy'}" />
          <div class="carousel__caption">${item.caption}</div>
        </div>
      `
      )
      .join('');

    const dotsHTML = slidesData
      .map(
        (_, index) => `
        <button
          class="carousel__dot ${index === 0 ? 'carousel__dot--active' : ''}"
          type="button"
          role="tab"
          aria-label="Chuyển tới ảnh ${index + 1}"
          aria-selected="${index === 0 ? 'true' : 'false'}"
          data-index="${index}"
        ></button>
      `
      )
      .join('');

    DOM.carouselTrack.innerHTML = slidesHTML;
    DOM.carouselDots.innerHTML = dotsHTML;
  },

  /**
   * Cập nhật vị trí Slide bằng GPU transform: translate3d
   */
  updateCarouselSlide(activeIndex) {
    DOM.carouselTrack.style.transform = `translate3d(-${activeIndex * 100}%, 0, 0)`;

    const slides = DOM.carouselTrack.querySelectorAll('.carousel__slide');
    const dots = DOM.carouselDots.querySelectorAll('.carousel__dot');

    slides.forEach((slide, idx) => {
      slide.classList.toggle('carousel__slide--active', idx === activeIndex);
    });

    dots.forEach((dot, idx) => {
      const isCurrent = idx === activeIndex;
      dot.classList.toggle('carousel__dot--active', isCurrent);
      dot.setAttribute('aria-selected', String(isCurrent));
    });
  },

  /**
   * Cập nhật icon âm thanh
   */
  updateAudioButton(isMuted) {
    DOM.audioIcon.textContent = isMuted ? '🔇' : '🔊';
  },
};

/* ============================================================================
   4. STARFIELD BACKGROUND MODULE (CANVAS PHASE 1)
   ============================================================================ */
const StarfieldController = {
  ctx: null,
  stars: [],
  animationFrameId: null,

  init() {
    if (!DOM.starCanvas) return;
    this.ctx = DOM.starCanvas.getContext('2d');
    this.resize();
    this.createStars(95);
    this.animate();

    window.addEventListener('resize', () => this.resize());
  },

  resize() {
    DOM.starCanvas.width = window.innerWidth;
    DOM.starCanvas.height = window.innerHeight;
  },

  createStars(count) {
    this.stars = Array.from({ length: count }, () => ({
      x: Math.random() * DOM.starCanvas.width,
      y: Math.random() * DOM.starCanvas.height,
      radius: Math.random() * 1.8 + 0.4,
      alpha: Math.random(),
      deltaAlpha: (Math.random() * 0.015 + 0.004) * (Math.random() < 0.5 ? 1 : -1),
    }));
  },

  animate() {
    if (AppState.isRevealed) {
      cancelAnimationFrame(this.animationFrameId);
      return;
    }

    const { ctx } = this;
    const { width, height } = DOM.starCanvas;
    ctx.clearRect(0, 0, width, height);

    this.stars.forEach((star) => {
      star.alpha += star.deltaAlpha;
      if (star.alpha <= 0.15 || star.alpha >= 1) {
        star.deltaAlpha *= -1;
      }

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 235, 245, ${star.alpha.toFixed(2)})`;
      ctx.fill();
    });

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  },
};

/* ============================================================================
   5. CONFETTI, TYPEWRITER, AUDIO & CAROUSEL CONTROLLERS (PHASE 2 LOGIC)
   ============================================================================ */
const EffectsController = {
  /**
   * Bắn pháo hoa & cánh hoa hồng bằng thư viện canvas-confetti
   */
  launchCelebrationConfetti() {
    if (typeof window.confetti !== 'function') return;

    const palette = ['#ff2a6d', '#ff7597', '#ffd166', '#ffb3c6', '#ffffff'];

    // Cú nổ lớn ngay khi mở quà
    window.confetti({
      particleCount: 110,
      spread: 85,
      origin: { y: 0.6 },
      colors: palette,
    });

    // Bắn pháo hoa 2 bên sườn liên tiếp trong 3.2 giây
    const duration = 3200;
    const endTime = Date.now() + duration;

    const frame = () => {
      window.confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors: palette,
      });
      window.confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors: palette,
      });

      if (Date.now() < endTime) {
        requestAnimationFrame(frame);
      }
    };

    requestAnimationFrame(frame);
  },

  /**
   * Hiệu ứng gõ chữ (Typewriter Effect)
   */
  startTypewriter() {
    const { message, signature, typingSpeedMs } = APP_CONFIG.greeting;
    DOM.cardSignature.textContent = signature;
    DOM.typewriterText.textContent = '';

    let charIndex = 0;
    const typeNextChar = () => {
      if (charIndex < message.length) {
        DOM.typewriterText.textContent += message.charAt(charIndex);
        charIndex += 1;
        setTimeout(typeNextChar, typingSpeedMs);
      } else {
        // Ẩn con trỏ nhấp nháy sau khi gõ xong 2 giây
        setTimeout(() => {
          DOM.typewriterCursor.classList.add('card__cursor--hidden');
        }, 2000);
      }
    };

    typeNextChar();
  },
};

const AudioController = {
  init() {
    DOM.bgMusic.src = APP_CONFIG.audio.src;
    DOM.bgMusic.volume = APP_CONFIG.audio.volume;

    DOM.audioToggleBtn.addEventListener('click', () => this.toggleMute());
  },

  /**
   * Mở khóa và phát nhạc ngay trong luồng sự kiện tương tác của người dùng
   */
  playMusic() {
    const playPromise = DOM.bgMusic.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Fallback nếu link nhạc lỗi hoặc bị trình duyệt chặn
        AppState.isAudioMuted = true;
        UIController.updateAudioButton(true);
      });
    }
  },

  toggleMute() {
    AppState.isAudioMuted = !AppState.isAudioMuted;
    DOM.bgMusic.muted = AppState.isAudioMuted;
    UIController.updateAudioButton(AppState.isAudioMuted);
  },
};

const CarouselController = {
  totalSlides: APP_CONFIG.gallery.length,

  init() {
    UIController.renderCarousel(APP_CONFIG.gallery);
    this.bindEvents();
  },

  goToSlide(index) {
    AppState.currentSlideIndex = (index + this.totalSlides) % this.totalSlides;
    UIController.updateCarouselSlide(AppState.currentSlideIndex);
  },

  nextSlide() {
    this.goToSlide(AppState.currentSlideIndex + 1);
  },

  prevSlide() {
    this.goToSlide(AppState.currentSlideIndex - 1);
  },

  startAutoPlay() {
    this.stopAutoPlay();
    AppState.carouselTimerId = setInterval(() => {
      this.nextSlide();
    }, APP_CONFIG.interaction.carouselIntervalMs);
  },

  stopAutoPlay() {
    if (AppState.carouselTimerId) {
      clearInterval(AppState.carouselTimerId);
      AppState.carouselTimerId = null;
    }
  },

  bindEvents() {
    DOM.carouselNextBtn.addEventListener('click', () => {
      this.nextSlide();
      this.startAutoPlay(); // Reset bộ đếm 3 giây khi người dùng chủ động bấm
    });

    DOM.carouselPrevBtn.addEventListener('click', () => {
      this.prevSlide();
      this.startAutoPlay();
    });

    DOM.carouselDots.addEventListener('click', (event) => {
      const dotBtn = event.target.closest('.carousel__dot');
      if (!dotBtn) return;

      const targetIndex = Number(dotBtn.dataset.index);
      this.goToSlide(targetIndex);
      this.startAutoPlay();
    });

    // Tạm dừng chuyển ảnh khi di chuột vào để xem kỹ hơn
    DOM.carousel.addEventListener('mouseenter', () => this.stopAutoPlay());
    DOM.carousel.addEventListener('mouseleave', () => this.startAutoPlay());
  },
};

/* ============================================================================
   6. MAIN INTERACTION CONTROLLER (ĐIỀU PHỐI PHASE 1 -> PHASE 2)
   ============================================================================ */
const AppController = {
  init() {
    StarfieldController.init();
    AudioController.init();
    CarouselController.init();
    this.bindHookEvents();
  },

  /**
   * Cộng điểm yêu thương và kiểm tra điều kiện đạt 100%
   */
  addLoveEnergy(amount) {
    if (AppState.isRevealed) return;

    AppState.progress = Math.min(100, AppState.progress + amount);
    UIController.updateProgressUI(AppState.progress);
    UIController.triggerPulseAndShake();

    if (AppState.progress >= 100) {
      this.triggerPhaseReveal();
    }
  },

  startHolding() {
    if (AppState.isRevealed || AppState.holdTimerId) return;

    AppState.holdTimerId = setInterval(() => {
      this.addLoveEnergy(APP_CONFIG.interaction.stepPerHoldTick);
    }, APP_CONFIG.interaction.holdIntervalMs);
  },

  stopHolding() {
    if (AppState.holdTimerId) {
      clearInterval(AppState.holdTimerId);
      AppState.holdTimerId = null;
    }
  },

  /**
   * Kích hoạt Phase 2 khi thanh tiến trình đạt 100%
   */
  triggerPhaseReveal() {
    AppState.isRevealed = true;
    this.stopHolding();

    // 1. Phát nhạc ngay lập tức (tận dụng User Gesture vừa click để bypass Autoplay Policy)
    AudioController.playMusic();

    // 2. Bắn pháo hoa chúc mừng
    EffectsController.launchCelebrationConfetti();

    // 3. Chuyển cảnh sang tấm thiệp Glassmorphism
    UIController.transitionToRevealPhase(() => {
      EffectsController.startTypewriter();
      CarouselController.startAutoPlay();
    });
  },

  bindHookEvents() {
    const { heartBtn } = DOM;

    // Sự kiện Click đơn
    heartBtn.addEventListener('click', () => {
      this.addLoveEnergy(APP_CONFIG.interaction.stepPerClick);
    });

    // Sự kiện Nhấn Giữ (Hỗ trợ cả Chuột & Cảm ứng trên Mobile)
    heartBtn.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      this.startHolding();
    });

    window.addEventListener('pointerup', () => this.stopHolding());
    window.addEventListener('pointercancel', () => this.stopHolding());
  },
};

// Khởi chạy ứng dụng khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  AppController.init();
});