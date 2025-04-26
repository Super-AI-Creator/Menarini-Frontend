
import CardBox from "../../shared/CardBox";
import { Icon } from "@iconify/react";
import Chart from 'react-apexcharts';
const ChartData: any = {
  series: (complete: number, pending: number, incomplete: number) => [complete, pending, incomplete],
  labels: ["Complete","Pending","Incomplete"],
  chart: {
    height: 230,
    fontFamily: "inherit",
    type: "donut",
  },
  plotOptions: {
    pie: {
      startAngle: -90,
      endAngle: 90,
      offsetY: 10,
      donut: {
        size: "90%",
      },
    },
  },
  grid: {
    padding: {
      bottom: -80,
    },
  },
  legend: {
    show: false,
  },
  dataLabels: {
    enabled: false,
    name: {
      show: false,
    },
  },
  stroke: {
    width: 2,
    colors: "var(--color-surface-ld)",
  },
  tooltip: {
    fillSeriesColor: false,
  },
  colors: [
    "var(--color-primary)",
    "var(--color-error)",
    "var(--color-secondary)",
  ],
};
interface CardType {
  complete: number;
  pending: number;
  incomplete: number;
  title: string;
}
const YourPerformance = ({ title, complete, pending, incomplete }: CardType) => {
  const total = complete + pending + incomplete;
  return (
    <>
      <CardBox>
        <div>
          <h5 className="card-title">{title}</h5>
          <p className="card-subtitle">{total} new data</p>
        </div>
        <div className="grid grid-cols-12 mt-6">
          <div className="md:col-span-6 col-span-12">
            <div className="flex flex-col gap-5">
              <div className="flex gap-4 items-center">
                <span className="h-12 w-12 flex-shrink-0 flex items-center justify-center bg-lightprimary rounded-tw">
                  <Icon
                    icon="solar:shop-2-linear"
                    className="text-primary"
                    height={24}
                  />
                </span>
                <div>
                  <h5 className="text-15">{complete} Complete</h5>
                  <p className="text-sm">{Math.round(complete / total * 100)}% Complete</p>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex gap-4 items-center">
                  <span className="h-12 w-12 flex-shrink-0 flex items-center justify-center bg-lighterror rounded-tw">
                    <Icon
                      icon="solar:filters-outline"
                      className="text-error"
                      height={24}
                    />
                  </span>
                  <div>
                    <h5 className="text-15">{pending} Pending</h5>
                    <p className="text-sm">{Math.round(pending / total * 100)}% Pending</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex gap-4 items-center">
                  <span className="h-12 w-12 flex-shrink-0 flex items-center justify-center bg-lightsecondary rounded-tw">
                    <Icon
                      icon="solar:pills-3-linear"
                      className="text-secondary"
                      height={24}
                    />
                  </span>
                  <div>
                    <h5 className="text-15">{incomplete} Incomplete</h5>
                    <p className="text-sm">{Math.round(incomplete / total * 100)}% Incomplete</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="md:col-span-6 col-span-12 md:-mt-8 mt-4">
            <Chart
              options={{
                ...ChartData,
                series: ChartData.series(complete, pending, incomplete)
              }}
              series={ChartData.series(complete, pending, incomplete)}
              type="polarArea"
              height="230px"
              width="100%"
            />
            <h4 className="text-center text-3xl md:mt-3">{total}</h4>
            <p className="text-sm text-center mt-3">
              Click here to look details.
            </p>
          </div>
        </div>
      </CardBox>
    </>
  );
};

export default YourPerformance;
