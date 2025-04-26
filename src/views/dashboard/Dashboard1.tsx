import Customer from "../../components/dashboards/Dashboard1/Customer"
import CustomerChart from "../../components/dashboards/Dashboard1/CustomerChart"
import Project from "../../components/dashboards/Dashboard1/Project"
import RevenueByProduct from "../../components/dashboards/Dashboard1/RevenueByProduct"
import RevenueForcast from "../../components/dashboards/Dashboard1/RevenueForcast"
import SalesOverview from "../../components/dashboards/Dashboard1/SalesOverview"
import TotalSettelment from "../../components/dashboards/Dashboard1/TotalSettelment"
import WelcomeBox from "../../components/dashboards/Dashboard1/WelcomeBox"
import YourPerformance from "../../components/dashboards/Dashboard1/YourPerformance"

const Dashboard1 = () => {
  return (
    <>
      <div className="grid grid-cols-12 gap-30">
        
        <div className="lg:col-span-6 col-span-12">
          <YourPerformance title="AX09 Staging" complete={10} pending={2} incomplete={3} />
        </div>
        <div className="lg:col-span-6 col-span-12">
          <YourPerformance title="Error" complete={9} pending={0} incomplete={1} />
        </div>
        <div className="lg:col-span-6 col-span-12">
          <YourPerformance title="Email" complete={18} pending={0} incomplete={2} />
        </div>
        <div className="lg:col-span-6 col-span-12">
          <YourPerformance title="OCR Extraction" complete={20} pending={0} incomplete={0} />
        </div>
        {/* <div className="lg:col-span-7 col-span-12">
            <div className="grid grid-cols-12 gap-30">
              <div className="md:col-span-6 col-span-12">
                <CustomerChart />
              </div>
              <div className="md:col-span-6 col-span-12">
                <SalesOverview />
              </div>
            </div>
          </div>
          <div className="lg:col-span-8 col-span-12">
            <RevenueByProduct />
          </div>
          <div className="lg:col-span-4 col-span-12">
            <TotalSettelment />
          </div> */}
      </div>
    </>
  )
}

export default Dashboard1;