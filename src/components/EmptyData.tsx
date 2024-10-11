interface EmptyDataProps {
  data: string;
}

const EmptyData: React.FC<EmptyDataProps> = (props) => {
  return (
    <div className="flex flex-col gap-6 items-center justify-center py-2">
      <img src="/astronaut/astronaut.png" alt="astro" className="w-[230px]" />
      <h3 className="text-[30px] font-bold text-n800">
        there is no {props.data} Founded
      </h3>
    </div>
  );
};

export default EmptyData;
