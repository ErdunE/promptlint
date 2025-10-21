/**
 * GHOST TEXT DEBUGGING SCRIPT
 * Run this in Chrome DevTools console on ChatGPT to diagnose ghost text issues
 * 
 * Usage:
 * 1. Load PromptLint extension on ChatGPT
 * 2. Open DevTools (F12)
 * 3. Paste this entire script into Console
 * 4. Type in a text input
 * 5. Check debug output
 */

(function debugGhostText() {
    console.log('=== GHOST TEXT DEBUGGING SUITE ===');
    
    // Test 1: Check if ghost text elements exist in DOM
    console.log('\n[Test 1] Checking for ghost text elements in DOM...');
    const ghostElements = document.querySelectorAll('.promptlint-ghost-text');
    console.log(`Found ${ghostElements.length} ghost text elements`);
    
    if (ghostElements.length > 0) {
        ghostElements.forEach((el, idx) => {
            console.log(`\nGhost Element ${idx + 1}:`);
            console.log('- HTML:', el.outerHTML);
            console.log('- Text Content:', el.textContent);
            console.log('- Computed Styles:', {
                display: window.getComputedStyle(el).display,
                visibility: window.getComputedStyle(el).visibility,
                opacity: window.getComputedStyle(el).opacity,
                position: window.getComputedStyle(el).position,
                zIndex: window.getComputedStyle(el).zIndex,
                top: window.getComputedStyle(el).top,
                left: window.getComputedStyle(el).left,
                width: window.getComputedStyle(el).width,
                height: window.getComputedStyle(el).height,
                color: window.getComputedStyle(el).color,
                backgroundColor: window.getComputedStyle(el).backgroundColor
            });
            console.log('- Bounding Rect:', el.getBoundingClientRect());
            console.log('- Parent:', el.parentElement?.tagName);
        });
    } else {
        console.warn('❌ NO ghost text elements found in DOM');
    }
    
    // Test 2: Check for CSP violations related to styles
    console.log('\n[Test 2] Checking for CSP violations...');
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (cspMeta) {
        console.log('CSP Policy:', cspMeta.getAttribute('content'));
    } else {
        console.log('No CSP meta tag found (may be in headers)');
    }
    
    // Test 3: Check input elements that should have ghost text
    console.log('\n[Test 3] Checking input elements...');
    const inputSelectors = [
        'textarea[placeholder*="message"]',
        'textarea[data-testid*="input"]',
        'input[type="text"]',
        '[contenteditable="true"]',
        '.ProseMirror',
        '#prompt-textarea'
    ];
    
    inputSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        console.log(`Selector: ${selector} - Found: ${elements.length} elements`);
    });
    
    // Test 4: Try to manually create ghost text to test rendering
    console.log('\n[Test 4] Creating test ghost text element...');
    const testGhost = document.createElement('div');
    testGhost.className = 'promptlint-ghost-text-test';
    testGhost.textContent = 'TEST GHOST TEXT - If you see this, rendering works';
    testGhost.style.cssText = `
        position: fixed;
        top: 100px;
        left: 100px;
        color: #ff0000;
        font-size: 20px;
        font-weight: bold;
        background: yellow;
        padding: 20px;
        z-index: 999999;
        border: 3px solid red;
    `;
    document.body.appendChild(testGhost);
    
    setTimeout(() => {
        const testVisible = document.querySelector('.promptlint-ghost-text-test');
        if (testVisible && testVisible.offsetParent !== null) {
            console.log('✅ Test ghost text IS VISIBLE - rendering works');
            console.log('- Computed Display:', window.getComputedStyle(testVisible).display);
            console.log('- Bounding Rect:', testVisible.getBoundingClientRect());
        } else {
            console.error('❌ Test ghost text NOT VISIBLE - rendering blocked');
        }
        
        // Clean up test element after 5 seconds
        setTimeout(() => {
            testVisible?.remove();
        }, 5000);
    }, 100);
    
    // Test 5: Check for conflicting styles
    console.log('\n[Test 5] Checking for style conflicts...');
    const allStyles = Array.from(document.styleSheets).map(sheet => {
        try {
            return Array.from(sheet.cssRules).map(rule => rule.cssText);
        } catch (e) {
            return ['(CORS blocked)'];
        }
    }).flat();
    
    const ghostStyleConflicts = allStyles.filter(rule => 
        rule.includes('promptlint') || rule.includes('ghost')
    );
    console.log(`Found ${ghostStyleConflicts.length} potentially related style rules:`, ghostStyleConflicts);
    
    // Test 6: Monitor for new ghost text elements
    console.log('\n[Test 6] Setting up MutationObserver for ghost text...');
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1 && node.classList?.contains('promptlint-ghost-text')) {
                    console.log('🆕 NEW ghost text element detected:', {
                        textContent: node.textContent,
                        styles: node.style.cssText,
                        computed: {
                            display: window.getComputedStyle(node).display,
                            visibility: window.getComputedStyle(node).visibility,
                            zIndex: window.getComputedStyle(node).zIndex
                        }
                    });
                }
            });
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    console.log('✅ MutationObserver active - will log any new ghost text elements');
    
    // Test 7: Check Level 5 initialization
    console.log('\n[Test 7] Checking Level 5 initialization...');
    console.log('Type in a text input and watch for ghost text creation...');
    
    return {
        summary: {
            ghostElementsFound: ghostElements.length,
            inputElementsFound: inputSelectors.reduce((sum, sel) => 
                sum + document.querySelectorAll(sel).length, 0
            ),
            testElementCreated: true,
            observerActive: true
        },
        stopObserver: () => {
            observer.disconnect();
            console.log('MutationObserver stopped');
        }
    };
})();

