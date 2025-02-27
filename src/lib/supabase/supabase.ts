export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      Config: {
        Row: {
          created_at: string;
          id: number;
          key: string | null;
          value: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          key?: string | null;
          value?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          key?: string | null;
          value?: string | null;
        };
        Relationships: [];
      };
      Event: {
        Row: {
          block: number;
          contractAddress: string;
          created_at: string;
          data: string;
          hash: string;
          id: number;
          status: number | null;
          timestamp: number;
          topic: string;
          txIndex: number;
        };
        Insert: {
          block: number;
          contractAddress: string;
          created_at?: string;
          data: string;
          hash: string;
          id?: number;
          status?: number | null;
          timestamp: number;
          topic: string;
          txIndex: number;
        };
        Update: {
          block?: number;
          contractAddress?: string;
          created_at?: string;
          data?: string;
          hash?: string;
          id?: number;
          status?: number | null;
          timestamp?: number;
          topic?: string;
          txIndex?: number;
        };
        Relationships: [];
      };
      Token: {
        Row: {
          address: string | null;
          created_at: string;
          created_timestamp: number | null;
          createEvent: number;
          creatorAddress: string;
          id: number;
          isGraduate: number | null;
          lpPositionId: string | null;
          marketCap: string | null;
          name: string | null;
          poolAddress: string | null;
          symbol: string | null;
          totalSupply: string | null;
          updated_timestamp: number | null;
        };
        Insert: {
          address?: string | null;
          created_at?: string;
          created_timestamp?: number | null;
          createEvent: number;
          creatorAddress: string;
          id?: number;
          isGraduate?: number | null;
          lpPositionId?: string | null;
          marketCap?: string | null;
          name?: string | null;
          poolAddress?: string | null;
          symbol?: string | null;
          totalSupply?: string | null;
          updated_timestamp?: number | null;
        };
        Update: {
          address?: string | null;
          created_at?: string;
          created_timestamp?: number | null;
          createEvent?: number;
          creatorAddress?: string;
          id?: number;
          isGraduate?: number | null;
          lpPositionId?: string | null;
          marketCap?: string | null;
          name?: string | null;
          poolAddress?: string | null;
          symbol?: string | null;
          totalSupply?: string | null;
          updated_timestamp?: number | null;
        };
        Relationships: [];
      };
      TokenInfo: {
        Row: {
          address: string;
          created_at: string;
          desc: string | null;
          id: number;
          name: string | null;
          picture: string | null;
          symbol: string | null;
          telegram: string | null;
          twitter: string | null;
          website: string | null;
        };
        Insert: {
          address: string;
          created_at?: string;
          desc?: string | null;
          id?: number;
          name?: string | null;
          picture?: string | null;
          symbol?: string | null;
          telegram?: string | null;
          twitter?: string | null;
          website?: string | null;
        };
        Update: {
          address?: string;
          created_at?: string;
          desc?: string | null;
          id?: number;
          name?: string | null;
          picture?: string | null;
          symbol?: string | null;
          telegram?: string | null;
          twitter?: string | null;
          website?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "TokenInfo_address_fkey";
            columns: ["address"];
            isOneToOne: true;
            referencedRelation: "Token";
            referencedColumns: ["address"];
          }
        ];
      };
      Trade: {
        Row: {
          created_at: string;
          event: number;
          fee: string;
          from: string;
          id: number;
          isGraduate: number;
          operatorTokenBalance: string;
          recipient: string;
          timestamp: number | null;
          tokenAddress: string | null;
          totalEth: string;
          totalSupply: string;
          trueEth: string;
          trueOrderSize: string;
          type: number;
        };
        Insert: {
          created_at?: string;
          event: number;
          fee: string;
          from: string;
          id?: number;
          isGraduate: number;
          operatorTokenBalance: string;
          recipient: string;
          timestamp?: number | null;
          tokenAddress?: string | null;
          totalEth: string;
          totalSupply: string;
          trueEth: string;
          trueOrderSize: string;
          type: number;
        };
        Update: {
          created_at?: string;
          event?: number;
          fee?: string;
          from?: string;
          id?: number;
          isGraduate?: number;
          operatorTokenBalance?: string;
          recipient?: string;
          timestamp?: number | null;
          tokenAddress?: string | null;
          totalEth?: string;
          totalSupply?: string;
          trueEth?: string;
          trueOrderSize?: string;
          type?: number;
        };
        Relationships: [
          {
            foreignKeyName: "Trade_tokenAddress_fkey";
            columns: ["tokenAddress"];
            isOneToOne: false;
            referencedRelation: "TokenInfo";
            referencedColumns: ["address"];
          }
        ];
      };
      Transfer: {
        Row: {
          amount: string;
          created_at: string;
          event: number | null;
          from: string;
          fromTokenBalance: string;
          id: number;
          timestamp: number | null;
          to: string;
          tokenAddress: string;
          totalSupply: string;
          toTokenBalance: string;
        };
        Insert: {
          amount: string;
          created_at?: string;
          event?: number | null;
          from: string;
          fromTokenBalance: string;
          id?: number;
          timestamp?: number | null;
          to: string;
          tokenAddress: string;
          totalSupply: string;
          toTokenBalance: string;
        };
        Update: {
          amount?: string;
          created_at?: string;
          event?: number | null;
          from?: string;
          fromTokenBalance?: string;
          id?: number;
          timestamp?: number | null;
          to?: string;
          tokenAddress?: string;
          totalSupply?: string;
          toTokenBalance?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_token_list: {
        Args: {
          p_search: string;
          p_offset: number;
          p_limit: number;
          p_sort: string;
          p_direction: string;
        };
        Returns: {
          id: number;
          name: string;
          symbol: string;
          totalSupply: string;
          address: string;
          creatorAddress: string;
          isGraduate: number;
          created_timestamp: number;
          updated_timestamp: number;
          picture: string;
          twitter: string;
          website: string;
          telegram: string;
          desc: string;
        }[];
      };
      get_top_holders: {
        Args: {
          p_address: string;
          p_limit: number;
        };
        Returns: {
          address: string;
          balance: string;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
  ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;
