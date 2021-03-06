import {create} from 'nano-css';
import {addon as addonRule} from 'nano-css/addon/rule';
import {addon as addonPipe} from 'nano-css/addon/pipe';

const nano = create({
    pfx: 'jsxpp-'
});

addonRule(nano);
addonPipe(nano);

const pipes = new WeakMap;


const plugin = (args) => {
    const props = args[1];

    if (!props) return args;

    const {$css} = props;

    if (!$css) return args;

    delete props.$css;

    if (process.env.NODE_ENV !== 'production') {
        if (typeof $css !== 'object') {
            console.error(
                `JSX++ $css plugin expected $css prop to be an object, received "${typeof $css}".`
            );
        }
    }

    const {$attach, $update, $detach} = props;

    props.$attach = (el, props) => {
        if ($attach) $attach(el, props);

        const pipe = nano.pipe();

        pipes.set(el, pipe);

        const self = {};
        let added = false;

        for (const prop in $css) {
            const value = $css[prop];

            if (typeof value !== 'object') {
                added = true;
                self[prop] = value;
            }
        }

        if (added) {
            $css['&'] = Object.assign($css['&'] || {}, self);
        }

        pipe.css($css);
        el.setAttribute(pipe.attr, '');
    };

    props.$update = (el, props, oldProps) => {
        if ($update) $update(el, props, oldProps);

        let pipe = pipes.get(el);

        if (!pipe) {
            pipe = nano.pipe();
            pipes.set(el, pipe);
            el.setAttribute(pipe.attr, '');
        }

        const self = {};
        let added = false;

        for (const prop in $css) {
            const value = $css[prop];

            if (typeof value !== 'object') {
                added = true;
                self[prop] = value;
            }
        }

        if (added) {
            $css['&'] = Object.assign($css['&'] || {}, self);
        }

        pipe.css($css);
    };

    props.$detach = (el, oldProps) => {
        if ($detach) $detach(el, oldProps);

        const pipe = pipes.get(el);

        pipes.delete(el);

        if (pipe) {
            el.removeAttribute(pipe.attr);
            pipe.remove();
        }
    };

    return args;
};

export default plugin;
