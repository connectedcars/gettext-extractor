import { HelloWorld } from 'tests/e2e/fixtures/js/hello.jsx';

export class View extends React.Component {
    constructor(props) {
        super(props);
        this.translations = props.translationService;
    }

    render() {
        return (
            <div>
                <HelloWorld/>
                <button onClick={this.refresh.bind(this)}>
                    { this.translations.get('Refresh') /* Comment */ }
                </button>
            </div>
        );
    }

    refresh() {
        let count = Math.round(Math.random() * 100);
        alert(this.translations.plural(count, 'One new message', '{{n}} new messages'));
        this.translations.get(
            `Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
            nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
            erat, sed diam voluptua.`);
    }
}
