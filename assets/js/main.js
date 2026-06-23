const lenis = new Lenis({
    duration: 1.15,
    smoothWheel: true,
    smoothTouch: false,
    wheelMultiplier: 1,
    touchMultiplier: 1.5,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);


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

gsap.registerPlugin(SplitText, ScrollTrigger);

const about = document.querySelector(".about");
const aboutLabel = document.querySelector(".about__label");
const aboutTitle = document.querySelector(".about__title");
const aboutText = document.querySelector(".about__text");

if (about && aboutLabel && aboutTitle && aboutText) {
    const titleSplit = new SplitText(aboutTitle, {
        type: "lines, words",
        linesClass: "about__line",
        wordsClass: "about__word",
    });

    const textSplit = new SplitText(aboutText, {
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

    ScrollTrigger.create({
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