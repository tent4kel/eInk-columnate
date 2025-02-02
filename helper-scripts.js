// Function to clean problematic attributes
var CleanHTML = function(doc) {
    var elements = doc.querySelectorAll('*');
    for (var i = 0; i < elements.length; i++) {
        var el = elements[i];
        var attributes = el.attributes;
        for (var j = attributes.length - 1; j >= 0; j--) {
            var attr = attributes[j];
            if (attr.name.indexOf('@') === 0 || attr.name.indexOf('v-') === 0 || attr.name.indexOf(':') !== -1) {
                el.removeAttribute(attr.name);
            }
        }
    }
    console.log('HTML cleaned of problematic attributes.');
};

  var SetColorScheme = function() {
        var hour = new Date().getHours();
        var prefersDark = (hour >= 18 || hour < 6);
        if (prefersDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
        }
        console.log('Color scheme set based on time: ' + (prefersDark ? 'dark' : 'light'));
    };

var UnfoldSections = function(doc) {
    try {
        var hiddenElements = doc.querySelectorAll('[hidden="until-found"]');
        for (var i = 0; i < hiddenElements.length; i++) {
            hiddenElements[i].removeAttribute('hidden');
            console.log('Removed hidden="until-found" attribute:', hiddenElements[i]);
        }

        var collapsibleToggles = doc.getElementsByClassName("mw-collapsible-toggle-collapsed");
        for (var j = 0; j < collapsibleToggles.length; j++) {
            var toggle = collapsibleToggles[j];
            if (toggle.childNodes[1] && typeof toggle.childNodes[1].click === "function") {
                toggle.childNodes[1].click();
                console.log("Clicked to expand a collapsible section:", toggle);
            }
        }

        var unfoldSelectors = [
            '.collapse',
            '.expandable',
            '[aria-expanded="false"]' 
        ];

        for (var k = 0; k < unfoldSelectors.length; k++) {
            var elements = doc.querySelectorAll(unfoldSelectors[k]);
            for (var l = 0; l < elements.length; l++) {
                var el = elements[l];
                if (el.getAttribute('aria-expanded') === 'false') {
                    el.setAttribute('aria-expanded', 'true');
                }
                if (typeof el.click === 'function') {
                    el.click();
                }
                console.log("Expanded section:", el);
            }
        }

        console.log("Collapsible sections unfolded.");
    } catch (error) {
        console.error("Error unfolding sections:", error);
    }
};

// Function to force load all images
var LoadAllImages = function(doc) {
    var images = doc.querySelectorAll('img');
    images.forEach(function(img) {
        img.setAttribute('loading', 'eager');
        img.src = img.src;
    });
    console.log('All images set to load eagerly.');
};

// Function to retrieve the hero image
var getHeroImage = function(document, article) {
    console.log('Starting hero image extraction.');
    var images = document.querySelectorAll('img:not([src$=".svg"])');
    var heroImage = null;
    var candidates = [];
    var maxCandidates = 5;

    var largeDimensions = { width: 600, height: 300 };
    var prominentClasses = ['hero', 'featured', 'main-image'];
    var descriptiveAltKeywords = ['article', 'hero'];
    var exclusionClasses = ['logo', 'icon', 'thumbnail', 'header', 'footer', 'sidebar'];
    var exclusionPatterns = ['logo', 'icon', 'thumbnail', 'abo', 'werbung', 'subscription','teaser'];

    images.forEach(function(img) {
        if (candidates.length >= maxCandidates) return;

        var width = img.naturalWidth;
        var height = img.naturalHeight;
        var altText = img.alt.toLowerCase();
        var src = img.src.toLowerCase();
        var className = img.className.toLowerCase();
        var id = img.id.toLowerCase();

        var isLarge = width > largeDimensions.width && height > largeDimensions.height;
        var isProminent = prominentClasses.some(function(cls) {
            return className.includes(cls) || id.includes(cls);
        });
        var hasDescriptiveAlt = descriptiveAltKeywords.some(function(keyword) {
            return altText.includes(keyword);
        }) || altText.length > 10;

        var isSmall = width < 300 || height < 200;
        var isRepetitive = exclusionPatterns.some(function(pattern) {
            return src.includes(pattern);
        });
        var isInNonContentArea = exclusionClasses.some(function(cls) {
            return className.includes(cls);
        });

        var isSVG = src.startsWith('data:image/svg+xml');

        console.log('Image analysis:', {
            src: img.src,
            width: width,
            height: height,
            altText: altText,
            className: className,
            id: id,
            isLarge: isLarge,
            isProminent: isProminent,
            hasDescriptiveAlt: hasDescriptiveAlt,
            isSmall: isSmall,
            isRepetitive: isRepetitive,
            isInNonContentArea: isInNonContentArea,
            isSVG: isSVG
        });

        if ((isLarge || isProminent || hasDescriptiveAlt) && !(isSmall || isRepetitive || isInNonContentArea || isSVG)) {
            console.log('Hero image candidate found:', img.src);
            candidates.push(img);
        }
    });

    if (candidates.length > 0) {
        heroImage = candidates[0];
        if (heroImage && !article.content.includes(heroImage.outerHTML)) {
            var articleElement = document.querySelector('#article-title');
            if (articleElement) {
                articleElement.insertAdjacentHTML('beforebegin', '<img src="' + heroImage.src + '" alt="' + heroImage.alt + '" class="' + heroImage.className + '" id="' + heroImage.id + '" />');
                console.log('Hero image inserted into the article.');
            }
        }
    }

    console.log('Hero image extraction completed. Hero image:', heroImage ? heroImage.src : 'None');
    return heroImage ? heroImage.src : null;
};
