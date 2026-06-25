const lenis = window.Lenis ? new window.Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.35,
}) : null;

let lenisVelocity = 0;

if (lenis) {
    lenis.on("scroll", ({ velocity }) => {
        lenisVelocity = velocity || 0;

        if (window.ScrollTrigger) {
            ScrollTrigger.update();
        }
    });

    const raf = (time) => {
        lenis.raf(time);
        requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);
}


if (window.gsap) {
    const preloader = document.querySelector(".preloader");
    const blobs = gsap.utils.toArray(".preloader__blob");
    const logoBox = document.querySelector(".preloader__logo-container");
    const headerMenu = document.querySelector(".header__menu");
    const headerContacts = document.querySelector(".header__aside-contacts");
    const folderSwap = document.querySelector("[data-folder-swap]");
    const hero = document.querySelector(".hero");
    const newsPanel = document.querySelector(".news");
    const heroContent = document.querySelector(".hero__content");
    const heroMedia = document.querySelector(".hero__media");
    const heroBg = document.querySelector(".hero__bg");
    const heroTextItems = gsap.utils.toArray(".hero__eyebrow, .hero__title, .hero__text, .hero__actions");
    let folderSwapStarted = false;
    let folderSwapFrame = null;

    const randomShape = () => {
        const points = Array.from({ length: 8 }, () => gsap.utils.random(38, 62, 1));

        return `${points[0]}% ${points[1]}% ${points[2]}% ${points[3]}% / ${points[4]}% ${points[5]}% ${points[6]}% ${points[7]}%`;
    };

    const resetBlob = (blob) => {
        gsap.set(blob, {
            xPercent: -50,
            yPercent: -50,
            x: gsap.utils.random(-18, 18, 1),
            y: gsap.utils.random(-18, 18, 1),
            scale: 0,
            rotate: gsap.utils.random(-18, 18, 1),
            opacity: 0,
            borderRadius: randomShape(),
        });
    };

    const getEdgeOffset = () => {
        const rootStyles = getComputedStyle(document.documentElement);

        return parseFloat(rootStyles.getPropertyValue("--header-edge-offset")) || 28;
    };

    const getFinalLogoScale = () => {
        const logoHeight = logoBox.offsetHeight;
        const contactsHeight = headerContacts ? headerContacts.offsetHeight : logoHeight * 0.5;

        return contactsHeight / logoHeight;
    };

    const getLogoCornerPosition = (finalLogoScale) => {
        const logoWidth = logoBox.offsetWidth;
        const logoHeight = logoBox.offsetHeight;
        const margin = getEdgeOffset();

        return {
            x: margin + (logoWidth * finalLogoScale) / 2 - window.innerWidth / 2,
            y: margin + (logoHeight * finalLogoScale) / 2 - window.innerHeight / 2,
        };
    };

    const getHeaderMenuY = () => {
        if (!headerMenu || !headerContacts) {
            return 0;
        }

        return headerContacts.offsetHeight - headerMenu.offsetHeight;
    };

    const createBlobWave = (blob) => {
        const wave = gsap.timeline();

        resetBlob(blob);

        wave
            .to(blob, {
                opacity: 1,
                scale: gsap.utils.random(0.18, 0.24, 0.01),
                duration: 0.22,
                ease: "power2.out",
            })
            .to(blob, {
                scale: gsap.utils.random(2.95, 3.25, 0.01),
                rotate: `+=${gsap.utils.random(75, 140, 1)}`,
                borderRadius: randomShape(),
                duration: gsap.utils.random(0.95, 1.14, 0.01),
                ease: "expo.inOut",
            })
            .to(blob, {
                scale: gsap.utils.random(0.04, 0.1, 0.01),
                x: gsap.utils.random(-26, 26, 1),
                y: gsap.utils.random(-26, 26, 1),
                rotate: `+=${gsap.utils.random(55, 105, 1)}`,
                borderRadius: randomShape(),
                opacity: 0,
                duration: gsap.utils.random(0.74, 0.9, 0.01),
                ease: "power3.inOut",
            });

        return wave;
    };

    const addLogoFlyAway = (timeline) => {
        const finalLogoScale = getFinalLogoScale();
        const position = getLogoCornerPosition(finalLogoScale);

        timeline
            .to(logoBox, {
                scale: 0.88,
                y: "-=18",
                duration: 0.18,
                ease: "power2.out",
            })
            .add("flyAway")
            .to(logoBox, {
                x: position.x,
                y: position.y,
                scale: finalLogoScale,
                rotate: -6,
                boxShadow: "0 12px 32px rgba(0, 48, 112, 0.18)",
                duration: 0.9,
                ease: "expo.inOut",
            })
            .add("settle");

        if (headerContacts) {
            timeline.to(headerContacts, {
                x: 0,
                opacity: 1,
                duration: 0.82,
                ease: "expo.inOut",
            }, "flyAway+=0.08");
        }

        if (headerMenu) {
            const headerMenuY = getHeaderMenuY();

            timeline.to(headerMenu, {
                y: headerMenuY,
                opacity: 1,
                duration: 0.72,
                ease: "expo.out",
            }, "flyAway+=0.22");
        }

        timeline
            .to(logoBox, {
                x: position.x + 8,
                rotate: 2,
                duration: 0.16,
                ease: "power2.out",
            }, "settle")
            .to(logoBox, {
                x: position.x - 4,
                rotate: -1,
                duration: 0.14,
                ease: "power1.inOut",
            })
            .to(logoBox, {
                x: position.x,
                y: position.y,
                rotate: 0,
                scale: finalLogoScale,
                duration: 0.34,
                ease: "back.out(1.8)",
            });

        if (headerContacts) {
            timeline
                .to(headerContacts, {
                    x: -8,
                    duration: 0.16,
                    ease: "power2.out",
                }, "settle")
                .to(headerContacts, {
                    x: 4,
                    duration: 0.14,
                    ease: "power1.inOut",
                }, "settle+=0.16")
                .to(headerContacts, {
                    x: 0,
                    duration: 0.34,
                    ease: "back.out(1.8)",
                }, "settle+=0.3");
        }
    };

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const folderEase = gsap.parseEase("power2.inOut");
    const folderFlyEase = gsap.parseEase("power3.in");

    const getFolderSwapProgress = () => {
        if (!folderSwap) {
            return 0;
        }

        const distance = folderSwap.offsetHeight - window.innerHeight;

        if (distance <= 0) {
            return 0;
        }

        return clamp(-folderSwap.getBoundingClientRect().top / distance, 0, 1);
    };
    const getFolderFlyProgress = () => {
        if (!folderSwap) {
            return 0;
        }

        const rect = folderSwap.getBoundingClientRect();
        const blockHeight = folderSwap.offsetHeight;

        // Сколько пользователь уже проскроллил внутри folderSwap
        const scrolledInside = -rect.top;

        // Вылет начинается раньше, пока блок ещё хорошо виден
        const flyStart = blockHeight * 0.62;

        // Длина вылета
        const flyDistance = window.innerHeight * 0.5;

        return clamp((scrolledInside - flyStart) / flyDistance, 0, 1);
    };

    const setFolderPanel = (panel, options) => {
        gsap.set(panel, {
            xPercent: -50,
            yPercent: -50,
            x: options.x,
            y: options.y,
            scale: options.scale,
            rotate: options.rotate,
            opacity: options.opacity,
            zIndex: options.zIndex,
            filter: `saturate(${options.saturate}) brightness(${options.brightness})`,
            boxShadow: options.shadow,
        });
    };

    const updateFolderSwap = () => {
        folderSwapFrame = null;

        if (!folderSwap || !hero || !newsPanel) {
            return;
        }


        const flyProgress = getFolderFlyProgress();
        const flyEased = folderFlyEase(flyProgress);
        const progress = getFolderSwapProgress();
        const eased = folderEase(progress);
        const sideOffset = Math.min(window.innerWidth * 0.06, 92);
        const depthOffset = Math.min(window.innerHeight * 0.055, 54);
        const frontShadow = "0 30px 78px rgba(0, 48, 112, 0.16), inset 0 0 0 1px rgba(255, 255, 255, 0.72)";
        const backShadow = "0 18px 48px rgba(0, 48, 112, 0.09), inset 0 0 0 1px rgba(255, 255, 255, 0.62)";

        setFolderPanel(hero, {
            x: -sideOffset * eased,
            y: depthOffset * eased,
            scale: 1 - 0.06 * eased,
            rotate: -2.8 * eased,
            opacity: 1 - 0.26 * eased,
            zIndex: progress < 0.52 ? 4 : 2,
            saturate: 1 - 0.08 * eased,
            brightness: 1 - 0.05 * eased,
            shadow: progress < 0.52 ? frontShadow : backShadow,
        });

        setFolderPanel(newsPanel, {
            x: sideOffset * (1 - eased),
            y: depthOffset * (1 - eased),
            scale: 0.94 + 0.06 * eased,
            rotate: 2.8 * (1 - eased),
            opacity: 0.74 + 0.26 * eased,
            zIndex: progress < 0.52 ? 2 : 4,
            saturate: 0.92 + 0.08 * eased,
            brightness: 0.96 + 0.04 * eased,
            shadow: progress < 0.52 ? backShadow : frontShadow,
        });

        gsap.set(folderSwap, {
            x: -window.innerWidth * 1.15 * flyEased,
            rotate: -8 * flyEased,
            opacity: 1 - flyEased,
            pointerEvents: flyProgress >= 1 ? "none" : "auto",
        });
    };

    const requestFolderSwapUpdate = () => {
        if (folderSwapFrame) {
            return;
        }

        folderSwapFrame = requestAnimationFrame(updateFolderSwap);
    };

    const initFolderSwap = () => {
        if (folderSwapStarted || !folderSwap || !hero || !newsPanel) {
            return;
        }

        folderSwapStarted = true;
        window.addEventListener("scroll", requestFolderSwapUpdate, {
            passive: true,
        });
        window.addEventListener("resize", requestFolderSwapUpdate);
        updateFolderSwap();
    };

    const revealHeroBlocks = () => {
        if (!hero || !heroContent || !heroMedia) {
            return;
        }

        hero.classList.add("is-revealed");

        const revealTimeline = gsap.timeline({
            defaults: {
                ease: "power3.out",
            },
        });

        revealTimeline
            .fromTo(heroContent, {
                x: -76,
                y: 28,
                rotate: -2,
                scale: 0.94,
                opacity: 0,
            }, {
                x: 0,
                y: 0,
                rotate: 0,
                scale: 1,
                opacity: 1,
                duration: 0.9,
                ease: "back.out(1.35)",
            })
            .fromTo(heroMedia, {
                x: 96,
                y: 26,
                rotate: 2,
                scale: 0.95,
                opacity: 0,
            }, {
                x: 0,
                y: 0,
                rotate: 0,
                scale: 1,
                opacity: 1,
                duration: 0.92,
                ease: "back.out(1.25)",
            }, "-=0.68");

        if (heroBg) {
            revealTimeline.fromTo(heroBg, {
                clipPath: "inset(12% 14% 12% 14% round 26px)",
            }, {
                clipPath: "inset(0% 0% 0% 0% round 26px)",
                duration: 0.88,
                ease: "expo.out",
            }, "-=0.72");
        }

        revealTimeline.fromTo(heroTextItems, {
            y: 18,
            opacity: 0,
        }, {
            y: 0,
            opacity: 1,
            duration: 0.52,
            stagger: 0.08,
            ease: "power2.out",
        }, "-=0.52");

        revealTimeline.call(initFolderSwap, null, "-=0.18");
    };

    const removePreloader = () => {
        if (preloader) {
            preloader.remove();
        }

        document.body.classList.add("is-loaded");
        revealHeroBlocks();
    };

    const playPreloader = () => {
        if (blobs.length === 0 || !logoBox) {
            return;
        }

        gsap.set(logoBox, {
            xPercent: -50,
            yPercent: -50,
            x: 0,
            y: 0,
            transformOrigin: "center",
            scale: 0.92,
            opacity: 0,
            rotate: 0,
        });

        if (headerContacts) {
            gsap.set(headerContacts, {
                x: headerContacts.offsetWidth + getEdgeOffset(),
                opacity: 0,
            });
        }

        if (headerMenu) {
            const headerMenuY = getHeaderMenuY();

            gsap.set(headerMenu, {
                xPercent: window.matchMedia("(max-width: 760px)").matches ? 0 : -50,
                y: headerMenuY - 14,
                opacity: 0,
            });
        }

        if (heroContent && heroMedia) {
            gsap.set([heroContent, heroMedia], {
                opacity: 0,
            });
        }

        if (heroTextItems.length > 0) {
            gsap.set(heroTextItems, {
                opacity: 0,
            });
        }

        gsap.to(logoBox, {
            scale: 1,
            opacity: 1,
            duration: 0.58,
            ease: "back.out(1.4)",
        });

        const timeline = gsap.timeline({
            onComplete: removePreloader,
        });

        timeline
            .add(createBlobWave(blobs[0]), 0.24)
            .add(createBlobWave(blobs[1]), 0.42);
        timeline.to(logoBox, {
            scale: 1.04,
            duration: 0.2,
            yoyo: true,
            repeat: 1,
            ease: "power1.inOut",
        }, 0.82);

        addLogoFlyAway(timeline);
    };

    window.addEventListener("load", playPreloader);

}

const NEWS_API_URL = "http://localhost:3001/api/news/popular?limit=4";
const NEWS_FALLBACK_IMAGE = "./assets/images/webp/bg02-scaled.webp";
const newsList = document.querySelector("[data-news-list]");

const formatNewsDate = (date) => new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
}).format(new Date(date));

const formatViews = (views) => new Intl.NumberFormat("ru-RU").format(views);

const createTextElement = (tagName, className, text) => {
    const element = document.createElement(tagName);

    element.className = className;
    element.textContent = text;

    return element;
};

const setNewsImageSource = (image, src) => {
    image.onerror = () => {
        image.onerror = null;
        image.classList.add("is-fallback");
        image.src = NEWS_FALLBACK_IMAGE;
    };

    image.src = src || NEWS_FALLBACK_IMAGE;
};

const createNewsCard = (newsItem) => {
    const card = document.createElement("article");
    const picture = document.createElement("div");
    const image = document.createElement("img");
    const content = document.createElement("div");
    const meta = document.createElement("div");
    const bottom = document.createElement("div");
    const link = document.createElement("a");

    card.className = "news-card";
    picture.className = "news-card__picture";
    image.className = "news-card__image";
    image.alt = "";
    image.referrerPolicy = "no-referrer";
    image.loading = "lazy";
    image.decoding = "async";
    setNewsImageSource(image, newsItem.image);
    content.className = "news-card__content";
    meta.className = "news-card__meta";
    bottom.className = "news-card__bottom";
    link.className = "news-card__link";
    link.href = newsItem.url || "#news";
    link.textContent = "Подробнее";

    meta.append(
        createTextElement("span", "news-card__category", newsItem.category),
        createTextElement("span", "news-card__views", `${formatViews(newsItem.views)} просмотров`)
    );

    content.append(
        meta,
        createTextElement("h3", "news-card__title", newsItem.title),
        createTextElement("p", "news-card__summary", newsItem.summary)
    );

    bottom.append(
        createTextElement("time", "news-card__date", formatNewsDate(newsItem.date)),
        link
    );

    picture.append(image);
    card.append(picture, content, bottom);

    return card;
};

const renderNews = (news) => {
    if (!newsList) {
        return;
    }

    const cards = news.map(createNewsCard);

    newsList.replaceChildren(...cards);

    if (window.gsap && cards.length > 0) {
        gsap.fromTo(cards, {
            y: 26,
            opacity: 0,
        }, {
            y: 0,
            opacity: 1,
            duration: 0.56,
            stagger: 0.08,
            ease: "power2.out",
        });
    }
};

const getPopularNews = async () => {
    const response = await fetch(NEWS_API_URL);

    if (!response.ok) {
        throw new Error("Failed to load news");
    }

    return response.json();
};

const loadNews = async () => {
    if (!newsList) {
        return;
    }

    try {
        const news = await getPopularNews();

        renderNews(news);
    } catch (error) {
        const status = createTextElement("p", "news__status", "Новости скоро появятся.");

        newsList.replaceChildren(status);
    }
};

loadNews();

const initStats = () => {
    if (!window.gsap) {
        return;
    }

    const stats = document.querySelector("[data-stats]");
    const numbers = stats ? gsap.utils.toArray(stats.querySelectorAll("[data-stat-number]")) : [];

    if (!stats || numbers.length === 0) {
        return;
    }

    const counterState = numbers.map(() => ({
        value: 0,
    }));

    const resetStats = () => {
        gsap.killTweensOf([stats, ...numbers, ...counterState]);

        numbers.forEach((number) => {
            number.textContent = "0";
        });

        counterState.forEach((state) => {
            state.value = 0;
        });

        gsap.set(stats, {
            y: 36,
            scale: 0.96,
            opacity: 0,
            filter: "blur(8px)",
        });

        gsap.set(numbers, {
            y: 18,
            opacity: 0,
        });
    };

    const playStats = () => {
        resetStats();

        const timeline = gsap.timeline({
            defaults: {
                ease: "power3.out",
            },
        });

        timeline
            .to(stats, {
                y: 0,
                scale: 1,
                opacity: 1,
                filter: "blur(0px)",
                duration: 0.54,
            })
            .to(numbers, {
                y: 0,
                opacity: 1,
                duration: 0.38,
                stagger: 0.08,
            }, "-=0.32");

        numbers.forEach((number, index) => {
            const target = Number(number.dataset.target) || 0;
            const state = counterState[index];

            timeline.to(state, {
                value: target,
                duration: 0.78,
                ease: "expo.out",
                onUpdate: () => {
                    number.textContent = Math.round(state.value).toLocaleString("ru-RU");
                },
                onComplete: () => {
                    number.textContent = target.toLocaleString("ru-RU");
                },
            }, 0.18 + index * 0.08);
        });
    };

    const hideStats = () => {
        gsap.killTweensOf([stats, ...numbers, ...counterState]);

        gsap.to(stats, {
            y: -20,
            scale: 0.98,
            opacity: 0,
            filter: "blur(6px)",
            duration: 0.42,
            ease: "power2.inOut",
        });
    };

    resetStats();

    if (window.ScrollTrigger) {
        gsap.registerPlugin(window.ScrollTrigger);

        window.ScrollTrigger.create({
            trigger: stats,
            start: "top 78%",
            end: "bottom 18%",
            onEnter: playStats,
            onEnterBack: playStats,
            onLeave: hideStats,
            onLeaveBack: hideStats,
        });

        if (stats.getBoundingClientRect().top <= window.innerHeight * 0.78) {
            playStats();
        }
    } else {
        playStats();
    }
};

initStats();

const initLearning = () => {
    if (!window.gsap) {
        return;
    }

    const learning = document.querySelector("[data-learning]");

    if (!learning) {
        return;
    }

    const revealItems = gsap.utils.toArray(learning.querySelectorAll("[data-learning-reveal]"));
    const cards = gsap.utils.toArray(learning.querySelectorAll("[data-learning-card]"));
    const routePath = learning.querySelector("[data-learning-path]");
    const routeDash = "5 18";

    const getLearningTargets = () => [learning, ...revealItems, ...cards, routePath].filter(Boolean);

    const resetLearning = () => {
        gsap.killTweensOf(getLearningTargets());

        gsap.set(learning, {
            opacity: 1,
        });

        gsap.set(revealItems, {
            y: 38,
            opacity: 0,
        });

        gsap.set(cards, {
            y: 62,
            rotate: (index) => [-4, 3, -2, 2][index] || 0,
            scale: 0.94,
            opacity: 0,
            filter: "blur(8px)",
        });

        if (routePath) {
            gsap.set(routePath, {
                opacity: 0,
                strokeDasharray: routeDash,
                strokeDashoffset: 130,
            });
        }
    };

    const playLearning = () => {
        resetLearning();

        const timeline = gsap.timeline({
            defaults: {
                ease: "power3.out",
            },
        });

        timeline.to(revealItems, {
            y: 0,
            opacity: 1,
            duration: 0.72,
            stagger: 0.08,
        });

        if (routePath) {
            timeline.to(routePath, {
                opacity: 1,
                strokeDashoffset: 0,
                duration: 1.1,
                ease: "power2.out",
            }, "-=0.42");
        }

        timeline.to(cards, {
            y: 0,
            rotate: 0,
            scale: 1,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.72,
            stagger: 0.1,
            ease: "back.out(1.28)",
        }, routePath ? "-=0.78" : "-=0.32");
    };

    const hideLearning = () => {
        gsap.killTweensOf(getLearningTargets());

        gsap.to(revealItems, {
            y: -22,
            opacity: 0,
            duration: 0.38,
            stagger: {
                each: 0.04,
                from: "end",
            },
            ease: "power2.inOut",
        });

        gsap.to(cards, {
            y: 30,
            scale: 0.98,
            opacity: 0,
            filter: "blur(6px)",
            duration: 0.44,
            stagger: {
                each: 0.05,
                from: "end",
            },
            ease: "power2.inOut",
        });

        if (routePath) {
            gsap.to(routePath, {
                opacity: 0,
                strokeDashoffset: -90,
                duration: 0.5,
                ease: "power2.inOut",
            });
        }
    };

    resetLearning();

    if (window.ScrollTrigger) {
        gsap.registerPlugin(window.ScrollTrigger);

        window.ScrollTrigger.create({
            trigger: learning,
            start: "top 70%",
            end: "bottom 16%",
            onEnter: playLearning,
            onEnterBack: playLearning,
            onLeave: hideLearning,
            onLeaveBack: hideLearning,
        });

        if (learning.getBoundingClientRect().top <= window.innerHeight * 0.7) {
            playLearning();
        }
    } else {
        playLearning();
    }
};

initLearning();

const initFitCheck = () => {
    if (!window.gsap) {
        return;
    }

    const fitCheck = document.querySelector("[data-fit-check]");

    if (!fitCheck) {
        return;
    }

    const revealItems = gsap.utils.toArray(fitCheck.querySelectorAll("[data-fit-reveal]"));
    const cards = gsap.utils.toArray(fitCheck.querySelectorAll("[data-fit-card]"));
    const routePath = fitCheck.querySelector("[data-fit-path]");
    const routeDash = "4 18";

    const getFitTargets = () => [fitCheck, ...revealItems, ...cards, routePath].filter(Boolean);

    const resetFitCheck = () => {
        gsap.killTweensOf(getFitTargets());

        gsap.set(revealItems, {
            y: 42,
            opacity: 0,
            filter: "blur(8px)",
        });

        gsap.set(cards, {
            y: 74,
            rotate: (index) => [-2.6, 2.2, -1.8, 1.4][index] || 0,
            scale: 0.94,
            opacity: 0,
            filter: "blur(10px)",
        });

        if (routePath) {
            gsap.set(routePath, {
                opacity: 0,
                strokeDasharray: routeDash,
                strokeDashoffset: 170,
            });
        }
    };

    const playFitCheck = () => {
        resetFitCheck();

        const timeline = gsap.timeline({
            defaults: {
                ease: "power3.out",
            },
        });

        timeline.to(revealItems, {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.82,
            stagger: 0.09,
        });

        if (routePath) {
            timeline.to(routePath, {
                opacity: 1,
                strokeDashoffset: 0,
                duration: 1.18,
                ease: "power2.out",
            }, "-=0.5");
        }

        timeline.to(cards, {
            y: 0,
            rotate: 0,
            scale: 1,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.82,
            stagger: 0.11,
            ease: "back.out(1.22)",
        }, routePath ? "-=0.72" : "-=0.28");
    };

    const hideFitCheck = () => {
        gsap.killTweensOf(getFitTargets());

        gsap.to(revealItems, {
            y: -26,
            opacity: 0,
            filter: "blur(7px)",
            duration: 0.58,
            stagger: {
                each: 0.045,
                from: "end",
            },
            ease: "power2.inOut",
        });

        gsap.to(cards, {
            y: 38,
            scale: 0.98,
            opacity: 0,
            filter: "blur(8px)",
            duration: 0.62,
            stagger: {
                each: 0.055,
                from: "end",
            },
            ease: "power2.inOut",
        });

        if (routePath) {
            gsap.to(routePath, {
                opacity: 0,
                strokeDashoffset: -120,
                duration: 0.64,
                ease: "power2.inOut",
            });
        }
    };

    resetFitCheck();

    if (window.ScrollTrigger) {
        gsap.registerPlugin(window.ScrollTrigger);

        window.ScrollTrigger.create({
            trigger: fitCheck,
            start: "top 72%",
            end: "bottom 12%",
            onEnter: playFitCheck,
            onEnterBack: playFitCheck,
            onLeave: hideFitCheck,
            onLeaveBack: hideFitCheck,
        });

        if (fitCheck.getBoundingClientRect().top <= window.innerHeight * 0.72) {
            playFitCheck();
        }
    } else {
        playFitCheck();
    }
};

initFitCheck();

const initContacts = () => {
    if (!window.gsap) {
        return;
    }

    const contacts = document.querySelector("[data-contacts]");

    if (!contacts) {
        return;
    }

    const revealItems = gsap.utils.toArray(contacts.querySelectorAll("[data-contact-reveal]"));
    const mapCard = contacts.querySelector("[data-contact-map]");
    const cards = gsap.utils.toArray(contacts.querySelectorAll("[data-contact-card]"));

    const getContactTargets = () => [contacts, ...revealItems, mapCard, ...cards].filter(Boolean);

    const resetContacts = () => {
        gsap.killTweensOf(getContactTargets());

        gsap.set(revealItems, {
            y: 34,
            opacity: 0,
            filter: "blur(7px)",
        });

        gsap.set(mapCard, {
            y: 68,
            rotate: -4,
            scale: 0.96,
            opacity: 0,
            filter: "blur(10px)",
        });

        gsap.set(cards, {
            x: 54,
            y: 26,
            rotate: (index) => [1.5, -1.2, 0.8][index] || 0,
            opacity: 0,
            filter: "blur(8px)",
        });
    };

    const playContacts = () => {
        resetContacts();

        const timeline = gsap.timeline({
            defaults: {
                ease: "power3.out",
            },
        });

        timeline.to(revealItems, {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.78,
            stagger: 0.08,
        });

        timeline.to(mapCard, {
            y: 0,
            rotate: -0.8,
            scale: 1,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.9,
            ease: "back.out(1.16)",
        }, "-=0.34");

        timeline.to(cards, {
            x: 0,
            y: 0,
            rotate: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.74,
            stagger: 0.09,
            ease: "power3.out",
        }, "-=0.58");
    };

    const hideContacts = () => {
        gsap.killTweensOf(getContactTargets());

        gsap.to(revealItems, {
            y: -22,
            opacity: 0,
            filter: "blur(6px)",
            duration: 0.5,
            stagger: {
                each: 0.04,
                from: "end",
            },
            ease: "power2.inOut",
        });

        gsap.to(mapCard, {
            y: 36,
            rotate: -2.4,
            scale: 0.98,
            opacity: 0,
            filter: "blur(7px)",
            duration: 0.58,
            ease: "power2.inOut",
        });

        gsap.to(cards, {
            x: 26,
            opacity: 0,
            filter: "blur(7px)",
            duration: 0.54,
            stagger: {
                each: 0.045,
                from: "end",
            },
            ease: "power2.inOut",
        });
    };

    resetContacts();

    if (window.ScrollTrigger) {
        gsap.registerPlugin(window.ScrollTrigger);

        window.ScrollTrigger.create({
            trigger: contacts,
            start: "top 72%",
            end: "bottom 10%",
            onEnter: playContacts,
            onEnterBack: playContacts,
            onLeave: hideContacts,
            onLeaveBack: hideContacts,
        });

        if (contacts.getBoundingClientRect().top <= window.innerHeight * 0.72) {
            playContacts();
        }
    } else {
        playContacts();
    }
};

initContacts();

const about = document.querySelector(".about");
const aboutLabel = document.querySelector(".about__label");
const aboutTitle = document.querySelector(".about__title");
const aboutText = document.querySelector(".about__text");

if (window.gsap && window.ScrollTrigger && window.SplitText && about && aboutLabel && aboutTitle && aboutText) {
    gsap.registerPlugin(window.ScrollTrigger, window.SplitText);

    const titleSplit = new window.SplitText(aboutTitle, {
        type: "lines, words",
        linesClass: "about__line",
        wordsClass: "about__word",
    });

    const textSplit = new window.SplitText(aboutText, {
        type: "lines",
        linesClass: "about__line",
    });

    const resetAbout = () => {
        gsap.set(aboutLabel, {
            y: 18,
            opacity: 0,
        });

        gsap.set(titleSplit.words, {
            yPercent: 120,
            rotate: 6,
            opacity: 0,
        });

        gsap.set(textSplit.lines, {
            yPercent: 120,
            opacity: 0,
        });
    };

    resetAbout();

    const aboutTimeline = gsap.timeline({
        paused: true,
        defaults: {
            ease: "power3.out",
        },
    });

    aboutTimeline
        .to(aboutLabel, {
            y: 0,
            opacity: 1,
            duration: 0.45,
        })
        .to(titleSplit.words, {
            yPercent: 0,
            rotate: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.025,
        }, "-=0.18")
        .to(textSplit.lines, {
            yPercent: 0,
            opacity: 1,
            duration: 0.75,
            stagger: 0.08,
        }, "-=0.45");

    window.ScrollTrigger.create({
        trigger: about,
        start: "top 72%",
        end: "bottom 28%",

        onEnter: () => {
            resetAbout();
            aboutTimeline.restart();
        },

        onEnterBack: () => {
            resetAbout();
            aboutTimeline.restart();
        },

        onLeave: () => {
            resetAbout();
            aboutTimeline.pause(0);
        },

        onLeaveBack: () => {
            resetAbout();
            aboutTimeline.pause(0);
        },
    });
}

const initPhotoCarousel = () => {
    if (!window.gsap) {
        return;
    }

    const carousel = document.querySelector("[data-photo-carousel]");
    const stage = carousel?.querySelector(".carousel__stage");
    const path = carousel?.querySelector("[data-carousel-path]");
    const string = carousel?.querySelector(".carousel__string");
    const stringShadow = carousel?.querySelector(".carousel__string-shadow");
    const headerItems = carousel ? gsap.utils.toArray(carousel.querySelectorAll(".carousel__eyebrow, .carousel__title")) : [];
    const cards = gsap.utils.toArray(".carousel__card");

    if (!carousel || !stage || !path || cards.length === 0) {
        return;
    }

    let pathLength = path.getTotalLength();
    let viewBox = path.ownerSVGElement.viewBox.baseVal;
    let targetProgress = 0;
    let currentProgress = 0;
    let previousProgress = 0;
    let springVelocity = 0;
    let frame = null;
    let activeKey = "";
    let revealProgress = 0;
    const revealState = {
        value: 0,
    };

    const carouselClamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const visibleCount = Math.min(3, cards.length);
    const revealEase = gsap.parseEase("power2.out");
    const smoothStep = (value) => {
        const clampedValue = carouselClamp(value, 0, 1);

        return clampedValue * clampedValue * (3 - 2 * clampedValue);
    };

    const getCarouselProgress = () => {
        const distance = carousel.offsetHeight - window.innerHeight;

        if (distance <= 0) {
            return 0;
        }

        const rawProgress = carouselClamp(-carousel.getBoundingClientRect().top / distance, 0, 1);
        const softStartZone = 0.11;

        return rawProgress * smoothStep(rawProgress / softStartZone);
    };

    const getCarouselRevealTarget = () => {
        const rect = carousel.getBoundingClientRect();
        const viewportHeight = window.innerHeight || 1;
        const enter = (viewportHeight * 1.08 - rect.top) / (viewportHeight * 0.82);

        return smoothStep(enter);
    };

    const renderCarouselReveal = (value) => {
        const easedValue = revealEase(carouselClamp(value, 0, 1));
        const hiddenOffset = 28 * (1 - easedValue);

        revealState.value = value;

        gsap.set(stage, {
            y: hiddenOffset,
            opacity: easedValue,
            filter: `blur(${(1 - easedValue) * 3}px)`,
        });

        gsap.set(headerItems, {
            y: 18 * (1 - easedValue),
            rotate: -0.35 * (1 - easedValue),
            opacity: easedValue,
        });

        gsap.set(path, {
            opacity: easedValue,
            strokeDashoffset: 150 * (1 - easedValue),
        });

        gsap.set(stringShadow, {
            opacity: easedValue * 0.9,
        });
    };

    const getActiveIndices = (progress) => {
        const maxStartIndex = Math.max(cards.length - visibleCount, 0);
        const stableProgress = progress <= 0.001 ? 0 : progress;
        const rawIndex = stableProgress * (maxStartIndex + 1);
        const startIndex = Math.min(Math.floor(rawIndex), maxStartIndex);
        const localProgress = carouselClamp(rawIndex - startIndex, 0, 1);
        const indices = Array.from({
            length: visibleCount,
        }, (_, slot) => startIndex + slot).filter((index) => index < cards.length);

        return {
            indices,
            localProgress,
        };
    };

    const setActiveCards = (indices) => {
        const nextKey = indices.join("-");

        if (nextKey === activeKey) {
            return;
        }

        const activeSet = new Set(indices);

        cards.forEach((card, index) => {
            if (activeSet.has(index)) {
                gsap.set(card, {
                    visibility: "visible",
                    pointerEvents: "auto",
                });
                return;
            }

            gsap.set(card, {
                x: -9999,
                visibility: "hidden",
                opacity: 0,
                pointerEvents: "none",
            });
        });

        activeKey = nextKey;
    };

    const setCardPosition = (card, slot, globalIndex, localProgress, progress, physicsSpeed) => {
        const stageWidth = stage.offsetWidth;
        const stageHeight = stage.offsetHeight;
        const pathProgress = carouselClamp(0.24 + (slot - localProgress) * 0.3, 0.08, 0.92);
        const point = path.getPointAtLength(pathLength * pathProgress);
        const nextPoint = path.getPointAtLength(pathLength * carouselClamp(pathProgress + 0.006, 0, 1));
        const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * 180 / Math.PI;
        const centerDistance = Math.abs(pathProgress - 0.54);
        const visiblePower = 1 - carouselClamp(centerDistance * 0.94, 0, 0.3);
        const float = Math.sin(progress * Math.PI * 3.2 + globalIndex * 1.1) * 3.5;
        const swing = carouselClamp(physicsSpeed * 20, -5, 5);
        const cardTilt = angle * 0.07 + swing + Math.sin(progress * Math.PI * 2.2 + globalIndex) * 1.1;
        const scale = 0.88 + visiblePower * 0.18;
        const reveal = revealEase(revealState.value);
        const outgoingFade = 1 - smoothStep(localProgress / 0.9);
        const incomingFade = smoothStep((localProgress - 0.05) / 0.85);
        const edgeFade = slot === 0
            ? outgoingFade
            : slot === visibleCount - 1
                ? incomingFade
                : 1;
        const endSpaceShift = smoothStep((progress - 0.9) / 0.1) * stageWidth * 0.14;
        const x = point.x / viewBox.width * stageWidth - endSpaceShift;
        const y = point.y / viewBox.height * stageHeight + float + Math.sin(globalIndex * 2.1) * 3;
        const baseOpacity = (0.5 + visiblePower * 0.5) * edgeFade;
        const revealOffset = (1 - reveal) * (42 + slot * 10);
        const revealTilt = (1 - reveal) * (slot - 1) * 3;

        gsap.set(card, {
            x,
            y: y + revealOffset,
            xPercent: -50,
            yPercent: -50,
            rotate: cardTilt + revealTilt,
            rotationX: carouselClamp(-physicsSpeed * 16, -4, 4) + (1 - reveal) * 3,
            rotationY: carouselClamp(physicsSpeed * 18, -5, 5),
            scale: scale * (0.9 + reveal * 0.1),
            opacity: baseOpacity * reveal,
            zIndex: Math.round(visiblePower * 100),
            filter: `blur(${(1 - reveal) * 2.5}px) saturate(${0.95 + visiblePower * 0.12}) brightness(${0.96 + visiblePower * 0.08})`,
            "--card-tilt": `${cardTilt}deg`,
            force3D: true,
        });
    };

    const updateCarousel = () => {
        targetProgress = getCarouselProgress();
        revealProgress += (getCarouselRevealTarget() - revealProgress) * 0.035;

        if (revealProgress < 0.002) {
            revealProgress = 0;
        } else if (revealProgress > 0.998) {
            revealProgress = 1;
        }

        renderCarouselReveal(revealProgress);

        const endEase = 1 - smoothStep((currentProgress - 0.88) / 0.12) * 0.28;
        const force = (targetProgress - currentProgress) * 0.052 * endEase;
        springVelocity = (springVelocity + force) * (0.78 - (1 - endEase) * 0.12);
        currentProgress += springVelocity;

        if (targetProgress >= 0.9995 && currentProgress >= 0.9992) {
            currentProgress = 1;
            springVelocity = 0;
        } else if (targetProgress <= 0.002 && currentProgress <= 0.003) {
            currentProgress = 0;
            springVelocity = 0;
        } else {
            currentProgress = carouselClamp(currentProgress, 0, 1);
        }

        const progressDelta = currentProgress - previousProgress;
        const lenisImpulse = carouselClamp(lenisVelocity * 0.006, -0.025, 0.025);
        const motionRamp = smoothStep(currentProgress / 0.12) * smoothStep(revealState.value);
        const physicsSpeed = (progressDelta * 14 + lenisImpulse) * motionRamp;

        const active = getActiveIndices(currentProgress);

        setActiveCards(active.indices);

        active.indices.forEach((cardIndex, slot) => {
            setCardPosition(cards[cardIndex], slot, cardIndex, active.localProgress, currentProgress, physicsSpeed);
        });

        previousProgress = currentProgress;
        frame = requestAnimationFrame(updateCarousel);
    };

    const refreshCarousel = () => {
        pathLength = path.getTotalLength();
        viewBox = path.ownerSVGElement.viewBox.baseVal;
    };

    window.addEventListener("resize", refreshCarousel);
    gsap.set(cards, {
        x: -9999,
        visibility: "hidden",
        opacity: 0,
        pointerEvents: "none",
    });
    gsap.set(string, {
        transformOrigin: "50% 50%",
    });
    renderCarouselReveal(0);

    refreshCarousel();
    updateCarousel();

    return () => {
        if (frame) {
            cancelAnimationFrame(frame);
        }

        window.removeEventListener("resize", refreshCarousel);
    };
};

if (window.gsap) {
    initPhotoCarousel();
}

document.addEventListener("DOMContentLoaded", () => {
    if (!window.gsap || !window.ScrollTrigger) {
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const footer = document.querySelector(".footer");
    const footerInner = document.querySelector(".footer__inner");

    if (!footer || !footerInner) {
        return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
        gsap.set([
            ".footer__inner",
            ".footer__brand",
            ".footer__column",
            ".footer__contacts",
            ".footer__bottom",
            ".footer__line"
        ], {
            clearProps: "all"
        });

        return;
    }

    const footerTimeline = gsap.timeline({
        paused: true,
        defaults: {
            ease: "power3.out"
        }
    });

    footerTimeline
        .fromTo(
            footerInner,
            {
                y: 120,
                scale: 0.96,
                opacity: 0,
                filter: "blur(14px)"
            },
            {
                y: 0,
                scale: 1,
                opacity: 1,
                filter: "blur(0px)",
                duration: 1.05
            }
        )
        .fromTo(
            ".footer__brand",
            {
                x: -46,
                opacity: 0
            },
            {
                x: 0,
                opacity: 1,
                duration: 0.75
            },
            "-=0.62"
        )
        .fromTo(
            ".footer__column",
            {
                y: 34,
                opacity: 0
            },
            {
                y: 0,
                opacity: 1,
                duration: 0.65,
                stagger: 0.08
            },
            "-=0.55"
        )
        .fromTo(
            ".footer__contacts",
            {
                x: 42,
                opacity: 0
            },
            {
                x: 0,
                opacity: 1,
                duration: 0.75
            },
            "-=0.55"
        )
        .fromTo(
            ".footer__bottom",
            {
                y: 34,
                opacity: 0
            },
            {
                y: 0,
                opacity: 1,
                duration: 0.72
            },
            "-=0.42"
        )
        .fromTo(
            ".footer__line",
            {
                opacity: 0,
                scaleX: 0,
                transformOrigin: "left center"
            },
            {
                opacity: 1,
                scaleX: 1,
                duration: 0.9,
                stagger: 0.12
            },
            "-=0.62"
        );

    ScrollTrigger.create({
        trigger: footer,
        start: "top 82%",
        end: "bottom 12%",
        animation: footerTimeline,
        toggleActions: "play reverse play reverse",
        invalidateOnRefresh: true
    });

    gsap.to(".footer__line--one", {
        x: 26,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });

    gsap.to(".footer__line--two", {
        x: -22,
        duration: 5.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });
});