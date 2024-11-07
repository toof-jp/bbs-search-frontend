export interface ResJson {
    no: number;
    name_and_trip: string;
    datetime: Date;
    datetime_text: string;
    id: string;
    main_text: string;
    main_text_html: string;
    oekaki_id: number;
    oekaki_title: string;
    original_oekaki_res_no: number;
  }
  
export interface CountJson {
  total_res_count: number;
  unique_id_count: number;
}
