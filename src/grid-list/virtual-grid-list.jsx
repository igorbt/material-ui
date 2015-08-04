import React from 'react';
import StylePropable from '../mixins/style-propable';
import DefaultRawTheme from '../styles/raw-themes/light-raw-theme';
import ThemeManager from '../styles/theme-manager';

import GridList from './grid-list';

import VirtualScroll from '../virtual-scroll/virtual-scroll';

const VirtualGridList = React.createClass({

  mixins: [
    StylePropable,
  ],

  contextTypes: {
    muiTheme: React.PropTypes.object,
  },

  propTypes: {
    buffer: React.PropTypes.number,
    cellHeight: React.PropTypes.number,
    // TODO write a validator
    children: React.PropTypes.func,
    cols: React.PropTypes.number,
    dataCount: React.PropTypes.number,
    dataProvider: React.PropTypes.func,
    padding: React.PropTypes.number,
    style: React.PropTypes.object,
  },

  //for passing default theme context to children
  childContextTypes: {
    muiTheme: React.PropTypes.object,
  },

  getChildContext() {
    return {
      muiTheme: this.state.muiTheme,
    };
  },

  getDefaultProps() {
    return {
      cols: 2,
      padding: 4,
      cellHeight: 180,
      buffer: 1,
    };
  },

  getInitialState() {
    return {
      muiTheme: this.context.muiTheme ? this.context.muiTheme : ThemeManager.getMuiTheme(DefaultRawTheme),
    };
  },

  //to update theme inside state whenever a new theme is passed down
  //from the parent / owner using context
  componentWillReceiveProps(nextProps, nextContext) {
    let newMuiTheme = nextContext.muiTheme ? nextContext.muiTheme : this.state.muiTheme;
    this.setState({muiTheme: newMuiTheme});
  },

  render() {
    const {
      cols,
      children,
      cellHeight,
      dataProvider,
      dataCount,
      buffer,
      padding,
      //childEnterTransition,
      style,
      ...other,
      } = this.props;

    const cellOuterHeight = cellHeight + padding;

    const childrenFactory = children;
    const viewHeight = parseInt(style.height) || window.innerHeight;
    let renderedCount = Math.ceil(viewHeight * (1 + buffer * 2) / cellOuterHeight) * cols;
    renderedCount = Math.min(renderedCount, dataCount);
    const renderedHeight = renderedCount / cols * cellOuterHeight;

    const scrollHeight = Math.ceil(dataCount / cols) * cellOuterHeight;

    return (
      <VirtualScroll
        scrollHeight={scrollHeight}
        renderedHeight={renderedHeight}
        style={style}
        {...other}
        >
        {
          (scrollTop) => {
            const
              requestedOffsetTop = Math.max(0, scrollTop - viewHeight * buffer),
              offset = Math.min(dataCount - renderedCount, Math.floor(requestedOffsetTop / cellOuterHeight) * cols),
              offsetTop = offset / cols * cellOuterHeight
              ;

            const items = dataProvider(offset, renderedCount);
            const currentChildren = items.map(childrenFactory);

            this._lastOffset = offset;

            const gridStyle = {
              transform: `translate3d(0, ${offsetTop}px, 0)`,
            };

            return {
              children: (
                <GridList
                  cols={cols}
                  cellHeight={cellHeight}
                  padding={padding}
                  style={gridStyle}
                  {...other}
                >
                  {currentChildren}
                </GridList>
                ),
              offsetTop: offsetTop,
            };
          }
        }
      </VirtualScroll>
    );
  },
});

module.exports = VirtualGridList;
