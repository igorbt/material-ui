import React from 'react';
import ReactDOM from 'react-dom';
import StylePropable from '../mixins/style-propable';

const VirtualScroll = React.createClass({

  mixins: [
    StylePropable,
  ],

  propTypes: {
    // TODO write a validator
    children: React.PropTypes.func,
    delta: React.PropTypes.number,
    renderedHeight: React.PropTypes.number,
    scrollHeight: React.PropTypes.number,
    style: React.PropTypes.object,
  },

  getDefaultProps() {
    return {
      delta: 200,
    };
  },

  getStyles() {
    return {
      root: {
        overflowY: 'auto',
        overflowX: 'hidden',
      },
      scroll: {
        height: this.props.scrollHeight,
      },
    };
  },

  getInitialState() {
    return {scrollTop: 0};
  },

  componentDidMount: function() {
    this._setupScrollHandler();
  },

  componentWillUnmount: function() {
    this._removeScrollHandler();
  },

  _setupScrollHandler() {
    // in some cases scroll event is not triggered
    // after page reloaded and kept it's scroll
    // so we call the handler from the start
    this._scrollHandler();

    ReactDOM.findDOMNode(this.refs.root).addEventListener('scroll', this._scrollHandler);
  },

  _removeScrollHandler() {
    ReactDOM.findDOMNode(this.refs.root).removeEventListener('scroll', this._scrollHandler);
  },

  _scrollHandler() {

    if (this._scrollRunning) { return; }
    this._scrollRunning = true;

    //if (this._animationFrame) {
    //  cancelAnimationFrame(this._animationFrame);
    //}
    this._animationFrame = requestAnimationFrame(() => {

      const scrollTop = ReactDOM.findDOMNode(this.refs.root).scrollTop;

      if (
        this._renderedOffsetTop + this.props.renderedHeight - this.props.delta < scrollTop + this.props.scrollHeight
        || this._renderedOffsetTop + this.props.delta > scrollTop
      ) {
        this.setState({scrollTop});
      }
      this._scrollRunning = false;
    });

  },

  render() {
    const childrenFactory = this.props.children;

    const {children, offsetTop} = childrenFactory(this.state.scrollTop);

    this._renderedOffsetTop = offsetTop;

    const styles = this.getStyles();

    const rootStyle = this.mergeStyles(this.props.style, styles.root);

    return (
      <div style={rootStyle} ref="root">
        <div style={styles.scroll}>
          {children}
        </div>
      </div>
    );
  },

});

module.exports = VirtualScroll;
