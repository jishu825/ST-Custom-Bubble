/**
 * 防抖函数装饰器
 * @param {number} delay - 延迟时间(ms)
 */
export function debounce(delay = 300) {
    return function(target, propertyKey, descriptor) {
        const original = descriptor.value;
        let timeout = null;

        descriptor.value = function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                original.apply(this, args);
            }, delay);
        };

        return descriptor;
    };
}

/**
 * 节流函数装饰器
 * @param {number} limit - 时间限制(ms)
 */
export function throttle(limit = 300) {
    return function(target, propertyKey, descriptor) {
        const original = descriptor.value;
        let timeout = null;
        let lastRun = 0;

        descriptor.value = function(...args) {
            if (!lastRun) {
                original.apply(this, args);
                lastRun = Date.now();
            } else {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    if ((Date.now() - lastRun) >= limit) {
                        original.apply(this, args);
                        lastRun = Date.now();
                    }
                }, limit - (Date.now() - lastRun));
            }
        };

        return descriptor;
    };
}

/**
 * 异步事件处理装饰器
 */
export function asyncHandler() {
    return function(target, propertyKey, descriptor) {
        const original = descriptor.value;
        
        descriptor.value = async function(...args) {
            try {
                await original.apply(this, args);
            } catch (error) {
                console.error(`Error in async event handler ${propertyKey}:`, error);
                throw error;
            }
        };

        return descriptor;
    };
}
