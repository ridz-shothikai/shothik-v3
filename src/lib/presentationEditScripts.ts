const PRIMARY_GREEN = "#07B37A";

// Enhanced iframe content with selection handling
const createEnhancedIframeContent = (originalContent: string) => {
  return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          
          /* Hover and selection styles */
          .selection-enabled {
            user-select: none !important;
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            cursor: pointer !important;
          }
          
          .selection-enabled * {
            user-select: none !important;
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            cursor: pointer !important;
          }
          
          /* Hover effect for elements */
          .element-hovered {
            outline: 2px dashed ${PRIMARY_GREEN} !important;
            outline-offset: 2px !important;
            background-color: ${PRIMARY_GREEN}20 !important;
            transition: all 0.2s ease !important;
          }
          
          /* Selected element style */
          .element-selected {
            outline: 3px solid ${PRIMARY_GREEN} !important;
            outline-offset: 2px !important;
            background-color: ${PRIMARY_GREEN}30 !important;
            box-shadow: 0 0 10px ${PRIMARY_GREEN}40 !important;
          }
        </style>
      </head>
      <body>
        ${originalContent ? originalContent : ""}
        
        <script>
          let isEditMode = false;
          
          // Listen for messages from parent
          window.addEventListener('message', function(event) {
            if (event.data.type === 'TOGGLE_EDIT_MODE') {
              isEditMode = event.data.enabled;
              toggleEditMode(isEditMode);
            }
          });
          
          function toggleEditMode(enabled) {
            const body = document.body;
            
            if (enabled) {
              body.classList.add('selection-enabled');
              enableSelection();
            } else {
              body.classList.remove('selection-enabled');
              disableSelection();
            }
          }
          
          function enableSelection() {
            // Add hover and click event listeners
            document.addEventListener('mouseover', handleElementHover);
            document.addEventListener('mouseout', handleElementMouseOut);
            document.addEventListener('click', handleElementClick);
          }
          
          function disableSelection() {
            // Remove hover and click event listeners
            document.removeEventListener('mouseover', handleElementHover);
            document.removeEventListener('mouseout', handleElementMouseOut);
            document.removeEventListener('click', handleElementClick);
            
            // Clear any existing highlights
            clearAllHighlights();
          }
          
          let currentHoveredElement = null;
          
          function handleElementHover(event) {
            if (!isEditMode) return;
            
            event.stopPropagation();
            const element = event.target;
            
            // Don't highlight body or html elements
            if (element === document.body || element === document.documentElement) {
              return;
            }
            
            // Clear previous highlight
            if (currentHoveredElement && currentHoveredElement !== element) {
              currentHoveredElement.classList.remove('element-hovered');
            }
            
            // Add hover highlight
            element.classList.add('element-hovered');
            currentHoveredElement = element;
          }
          
          function handleElementMouseOut(event) {
            if (!isEditMode) return;
            
            const element = event.target;
            element.classList.remove('element-hovered');
            
            if (currentHoveredElement === element) {
              currentHoveredElement = null;
            }
          }
          
          function handleElementClick(event) {
            if (!isEditMode) return;
            
            event.preventDefault();
            event.stopPropagation();
            
            const element = event.target;
            
            // Don't select body or html elements
            if (element === document.body || element === document.documentElement) {
              return;
            }
            
            // Clear all previous selections
            clearAllHighlights();
            
            // Add selected highlight
            element.classList.add('element-selected');
            
            // Get element information
            const selectionInfo = getElementSelectionInfo(element);
            
            // Send selection data to parent
            window.parent.postMessage({
              type: 'ELEMENT_SELECTED',
              data: selectionInfo
            }, '*');
          }
          
          function clearAllHighlights() {
            // Remove all hover highlights
            const hoveredElements = document.querySelectorAll('.element-hovered');
            hoveredElements.forEach(el => el.classList.remove('element-hovered'));
            
            // Remove all selected highlights
            const selectedElements = document.querySelectorAll('.element-selected');
            selectedElements.forEach(el => el.classList.remove('element-selected'));
          }
          
          function getElementSelectionInfo(element) {
            const elementInfo = getElementInfo(element);
            const elementPath = getElementPath(element);
            const boundingRect = element.getBoundingClientRect();
            
            return {
              element: elementInfo,
              elementPath: elementPath,
              innerHTML: element.innerHTML,
              outerHTML: element.outerHTML,
              textContent: element.textContent,
              boundingRect: {
                top: boundingRect.top,
                left: boundingRect.left,
                width: boundingRect.width,
                height: boundingRect.height,
                bottom: boundingRect.bottom,
                right: boundingRect.right
              },
              computedStyles: getComputedStylesForElement(element),
              timestamp: new Date().toISOString(),
              elementType: getElementType(element)
            };
          }
          
          function getComputedStylesForElement(element) {
            const computedStyle = window.getComputedStyle(element);
            return {
              display: computedStyle.display,
              position: computedStyle.position,
              width: computedStyle.width,
              height: computedStyle.height,
              margin: computedStyle.margin,
              padding: computedStyle.padding,
              backgroundColor: computedStyle.backgroundColor,
              color: computedStyle.color,
              fontSize: computedStyle.fontSize,
              fontFamily: computedStyle.fontFamily,
              fontWeight: computedStyle.fontWeight,
              textAlign: computedStyle.textAlign,
              border: computedStyle.border,
              borderRadius: computedStyle.borderRadius
            };
          }
          
          function getElementType(element) {
            const tagName = element.tagName.toLowerCase();
            
            if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
              return 'heading';
            } else if (['p', 'span', 'div'].includes(tagName)) {
              return 'text';
            } else if (['img', 'svg', 'canvas'].includes(tagName)) {
              return 'media';
            } else if (['a'].includes(tagName)) {
              return 'link';
            } else if (['button', 'input', 'select', 'textarea'].includes(tagName)) {
              return 'interactive';
            } else if (['ul', 'ol', 'li'].includes(tagName)) {
              return 'list';
            } else {
              return 'container';
            }
          }
          
          function getSelectionInfo(range, selectedText) {
            const startContainer = range.startContainer;
            const endContainer = range.endContainer;
            
            // Get the closest element containers
            const startElement = startContainer.nodeType === Node.TEXT_NODE 
              ? startContainer.parentElement 
              : startContainer;
            const endElement = endContainer.nodeType === Node.TEXT_NODE 
              ? endContainer.parentElement 
              : endContainer;
            
            // Get element paths for better identification
            const startPath = getElementPath(startElement);
            const endPath = getElementPath(endElement);
            
            // Get surrounding context
            const contextBefore = getContextText(range, 'before', 50);
            const contextAfter = getContextText(range, 'after', 50);
            
            // Get element attributes and properties
            const startElementInfo = getElementInfo(startElement);
            const endElementInfo = getElementInfo(endElement);
            
            return {
              selectedText,
              selectionLength: selectedText.length,
              startOffset: range.startOffset,
              endOffset: range.endOffset,
              startElement: startElementInfo,
              endElement: endElementInfo,
              startPath,
              endPath,
              contextBefore,
              contextAfter,
              htmlContent: range.cloneContents().textContent,
              timestamp: new Date().toISOString(),
              boundingRect: range.getBoundingClientRect()
            };
          }
          
          function getElementPath(element) {
            const path = [];
            let current = element;
            
            while (current && current !== document.body) {
              let selector = current.tagName.toLowerCase();
              
              if (current.id) {
                selector += '#' + current.id;
              } else if (current.className) {
                const classes = current.className.trim().split(/\\s+/);
                selector += '.' + classes.join('.');
              } else {
                // Add nth-child if no id or class
                const siblings = Array.from(current.parentNode.children);
                const index = siblings.indexOf(current) + 1;
                selector += ':nth-child(' + index + ')';
              }
              
              path.unshift(selector);
              current = current.parentElement;
            }
            
            return path.join(' > ');
          }
          
          function getElementInfo(element) {
            return {
              tagName: element.tagName.toLowerCase(),
              id: element.id || null,
              className: element.className || null,
              textContent: element.textContent.substring(0, 100),
              attributes: Array.from(element.attributes).reduce((acc, attr) => {
                acc[attr.name] = attr.value;
                return acc;
              }, {})
            };
          }
          
          function getContextText(range, direction, maxLength) {
            try {
              const container = direction === 'before' ? range.startContainer : range.endContainer;
              const offset = direction === 'before' ? range.startOffset : range.endOffset;
              
              let text = '';
              
              if (container.nodeType === Node.TEXT_NODE) {
                const fullText = container.textContent;
                if (direction === 'before') {
                  text = fullText.substring(Math.max(0, offset - maxLength), offset);
                } else {
                  text = fullText.substring(offset, Math.min(fullText.length, offset + maxLength));
                }
              }
              
              return text.trim();
            } catch (error) {
              return '';
            }
          }
          
          // Prevent default context menu in edit mode
          document.addEventListener('contextmenu', function(event) {
            if (isEditMode) {
              event.preventDefault();
            }
          });
        </script>
      </body>
      </html>
    `;
};

export default createEnhancedIframeContent;
