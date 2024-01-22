import './App.css';
import OrgLookupCSVComponent from './components/OrgLookupComponent';
import OrgAnalysisComponent from './components/StatisticsSummaryComponent';

function App() {

    return (
        <div className="container">
            <div className="component-container">
                <OrgLookupCSVComponent />
            </div>

            <div className="separator"></div>
    
            <div className="component-container">
                <OrgAnalysisComponent />
            </div>
        </div>
    );
}


export default App;